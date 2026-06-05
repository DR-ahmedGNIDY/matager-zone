"use server";

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/validators/auth";
import { getErrorMessage } from "@/lib/utils";
import { BCRYPT_ROUNDS, EMAIL_VERIFY_EXPIRY, RESET_PASSWORD_EXPIRY } from "@/lib/constants";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ApiResponse } from "@/types";

// ── Register ──────────────────────────────────────────────────
export async function registerAction(
  formData: unknown
): Promise<ApiResponse<{ requiresVerification: boolean }>> {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }
  const { firstName, lastName, email, phone, password } = parsed.data;

  try {
    // Check email exists
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, deletedAt: true },
    });

    if (existing && !existing.deletedAt) {
      return { success: false, error: "هذا البريد الإلكتروني مسجل مسبقاً" };
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Check if email verification required
    const settings = await db.platformSettings.findFirst({ select: { requireEmailVerification: true } });
    const needsVerification = settings?.requireEmailVerification ?? true;

    const verifyToken = needsVerification ? crypto.randomBytes(32).toString("hex") : null;
    const verifyTokenExpiry = needsVerification
      ? new Date(Date.now() + EMAIL_VERIFY_EXPIRY)
      : null;

    const user = await db.user.create({
      data: {
        name: fullName,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashed,
        role: "CUSTOMER",
        emailVerified: needsVerification ? null : new Date(),
        verifyToken,
        verifyTokenExpiry,
      },
    });

    // Create empty wishlist and cart
    await db.wishlist.create({ data: { userId: user.id } });

    // Send emails
    if (needsVerification && verifyToken) {
      await sendVerificationEmail(user.email, fullName, verifyToken).catch(console.error);
    } else {
      await sendWelcomeEmail(user.email, fullName).catch(console.error);
    }

    // Audit log
    await db.auditLog.create({
      data: {
        action: "USER_REGISTERED",
        entity: "User",
        entityId: user.id,
        userId: user.id,
        metadata: { email: user.email, method: "credentials" },
      },
    });

    return { success: true, data: { requiresVerification: needsVerification } };
  } catch (err) {
    console.error("Register error:", err);
    return { success: false, error: "حدث خطأ أثناء التسجيل. حاول مرة أخرى." };
  }
}

// ── Login ─────────────────────────────────────────────────────
// FIX BUG-7: signIn("credentials") with redirect:false in Next-Auth v5
// throws AuthError on failure — we catch it and map to friendly messages.
// On success it returns undefined (no error thrown).
export async function loginAction(
  formData: unknown,
  callbackUrl?: string
): Promise<ApiResponse<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    // In Next-Auth v5, signIn with redirect:false throws on error, returns on success
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase().trim(),
      password: parsed.data.password,
      redirect: false,
    });
    // If we reach here, sign-in succeeded
    return { success: true, data: { redirectTo: callbackUrl || "/" } };
  } catch (err) {
    if (err instanceof AuthError) {
      const msg = err.cause?.err?.message ?? err.message ?? "";
      if (msg.includes("EMAIL_NOT_VERIFIED"))
        return { success: false, error: "يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق البريد." };
      if (msg.includes("ACCOUNT_SUSPENDED"))
        return { success: false, error: "حسابك موقوف. تواصل مع فريق الدعم." };
      if (msg.includes("ACCOUNT_LOCKED"))
        return { success: false, error: "حسابك مغلق مؤقتاً لمدة 15 دقيقة بسبب محاولات متعددة." };
      // CredentialsSignin = wrong email/password
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }
    console.error("Login error:", err);
    return { success: false, error: "حدث خطأ. حاول مرة أخرى." };
  }
}

// ── Google Login ──────────────────────────────────────────────
export async function googleLoginAction() {
  await signIn("google", { redirectTo: "/" });
}

// ── Logout ────────────────────────────────────────────────────
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

// ── Verify Email ──────────────────────────────────────────────
export async function verifyEmailAction(token: string): Promise<ApiResponse> {
  if (!token) return { success: false, error: "رمز التحقق غير صحيح" };

  try {
    const user = await db.user.findUnique({
      where: { verifyToken: token },
      select: { id: true, verifyTokenExpiry: true, emailVerified: true },
    });

    if (!user) return { success: false, error: "رمز التحقق غير صحيح أو منتهي الصلاحية" };
    if (user.emailVerified) return { success: true, message: "البريد الإلكتروني مؤكد مسبقاً" };
    if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
      return { success: false, error: "رمز التحقق منتهي الصلاحية. اطلب رمزاً جديداً." };
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    });

    return { success: true, message: "تم تأكيد البريد الإلكتروني بنجاح" };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

// ── Resend Verification ───────────────────────────────────────
export async function resendVerificationAction(email: string): Promise<ApiResponse> {
  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, emailVerified: true, deletedAt: true },
    });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified || user.deletedAt) {
      return { success: true, message: "تم إرسال بريد التحقق إذا كان الحساب موجوداً" };
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");
    await db.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiry: new Date(Date.now() + EMAIL_VERIFY_EXPIRY),
      },
    });

    await sendVerificationEmail(email, user.name || "المستخدم", verifyToken).catch(console.error);

    return { success: true, message: "تم إرسال بريد التحقق إذا كان الحساب موجوداً" };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

// ── Forgot Password ───────────────────────────────────────────
export async function forgotPasswordAction(formData: unknown): Promise<ApiResponse> {
  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { email } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, deletedAt: true, isActive: true },
    });

    // Always return success to prevent email enumeration
    if (!user || user.deletedAt || !user.isActive) {
      return { success: true, message: "إذا كان الحساب موجوداً، ستصل رسالة إعادة التعيين." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + RESET_PASSWORD_EXPIRY),
      },
    });

    await sendPasswordResetEmail(email, user.name || "المستخدم", resetToken).catch(console.error);

    // Audit log
    await db.auditLog.create({
      data: {
        action: "PASSWORD_RESET_REQUESTED",
        entity: "User",
        entityId: user.id,
        userId: user.id,
        metadata: { email },
      },
    });

    return { success: true, message: "إذا كان الحساب موجوداً، ستصل رسالة إعادة التعيين." };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

// ── Reset Password ────────────────────────────────────────────
export async function resetPasswordAction(formData: unknown): Promise<ApiResponse> {
  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { token, password } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { resetToken: token },
      select: { id: true, resetTokenExpiry: true, email: true },
    });

    if (!user) return { success: false, error: "رمز إعادة التعيين غير صحيح أو منتهي الصلاحية" };
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return { success: false, error: "رمز إعادة التعيين منتهي الصلاحية. اطلب رمزاً جديداً." };
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "PASSWORD_RESET_COMPLETED",
        entity: "User",
        entityId: user.id,
        userId: user.id,
        metadata: { email: user.email },
      },
    });

    return { success: true, message: "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن." };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

// ── Change Password (authenticated user) ─────────────────────
export async function changePasswordAction(
  userId: string,
  formData: unknown
): Promise<ApiResponse> {
  const { changePasswordSchema } = await import("@/validators/auth");
  const parsed = changePasswordSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { currentPassword, newPassword } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) return { success: false, error: "لا يمكن تغيير كلمة المرور لحسابات التسجيل الاجتماعي" };

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return { success: false, error: "كلمة المرور الحالية غير صحيحة" };

    const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await db.user.update({ where: { id: userId }, data: { password: hashed } });

    await db.auditLog.create({
      data: {
        action: "PASSWORD_CHANGED",
        entity: "User",
        entityId: userId,
        userId,
      },
    });

    revalidatePath("/dashboard/customer/profile");
    return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
