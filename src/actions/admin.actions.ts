"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import {
  approveStore, rejectStore, suspendStore, reactivateStore,
  toggleUserActive,
  createCategory, updateCategory,
  approveReview, deleteReview,
  updatePlatformSettings,
} from "@/services/admin.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getAdminId(): Promise<string> {
  const user = await requireAdmin();
  return user.id;
}

// ── Store actions ─────────────────────────────────────────────

export async function approveStoreAction(
  storeId: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await getAdminId();
  const result = await approveStore(storeId, adminId);
  if (result.success) {
    revalidatePath("/dashboard/admin");
    revalidatePath(`/store`);
  }
  return result;
}

export async function rejectStoreAction(
  storeId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!reason?.trim()) return { success: false, error: "سبب الرفض مطلوب" };
  const adminId = await getAdminId();
  const result = await rejectStore(storeId, adminId, reason);
  if (result.success) revalidatePath("/dashboard/admin");
  return result;
}

export async function suspendStoreAction(
  storeId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await getAdminId();
  const result = await suspendStore(storeId, adminId, reason || "مخالفة سياسة المنصة");
  if (result.success) revalidatePath("/dashboard/admin");
  return result;
}

export async function reactivateStoreAction(
  storeId: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await getAdminId();
  const result = await reactivateStore(storeId, adminId);
  if (result.success) revalidatePath("/dashboard/admin");
  return result;
}

// ── User actions ──────────────────────────────────────────────

export async function toggleUserActiveAction(
  targetUserId: string
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  const adminId = await getAdminId();
  const result = await toggleUserActive(targetUserId, adminId);
  if (result.success) revalidatePath("/dashboard/admin");
  return result;
}

// ── Category actions ──────────────────────────────────────────

const categorySchema = z.object({
  name:        z.string().min(2).max(60),
  nameAr:      z.string().min(2).max(60),
  emoji:       z.string().min(1).max(10),
  slug:        z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional(),
});

export async function createCategoryAction(
  input: unknown
): Promise<{ success: boolean; id?: string; error?: string }> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const adminId = await getAdminId();
  const cat = await createCategory(parsed.data, adminId);
  revalidatePath("/dashboard/admin");
  revalidatePath("/stores");
  return { success: true, id: cat.id };
}

export async function updateCategoryAction(
  id: string,
  data: { nameAr?: string; emoji?: string; isActive?: boolean; sortOrder?: number }
): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: "معرف التصنيف مطلوب" };
  const adminId = await getAdminId();
  await updateCategory(id, data, adminId);
  revalidatePath("/dashboard/admin");
  revalidatePath("/stores");
  return { success: true };
}

// ── Review actions ────────────────────────────────────────────

export async function approveReviewAction(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await getAdminId();
  await approveReview(reviewId, adminId);
  revalidatePath("/dashboard/admin");
  return { success: true };
}

export async function deleteReviewAction(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const adminId = await getAdminId();
  await deleteReview(reviewId, adminId);
  revalidatePath("/dashboard/admin");
  return { success: true };
}

// ── Settings action ───────────────────────────────────────────

const settingsSchema = z.object({
  siteName:                 z.string().min(2).max(100).optional(),
  siteDescription:          z.string().max(300).optional(),
  supportEmail:             z.string().email().optional().or(z.literal("")),
  supportWhatsapp:          z.string().max(20).optional(),
  maintenanceMode:          z.boolean().optional(),
  allowRegistration:        z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  autoApproveStores:        z.boolean().optional(),
});

export async function updatePlatformSettingsAction(
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const adminId = await getAdminId();
  await updatePlatformSettings({
    ...parsed.data,
    supportEmail: parsed.data.supportEmail || undefined,
  }, adminId);

  revalidatePath("/dashboard/admin");
  return { success: true };
}
