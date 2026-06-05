"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/validators/auth";
import { registerAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch("password", "");

  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const levels = [
      { w: "25%", color: "#EF4444", label: "ضعيفة" },
      { w: "50%", color: "#F59E0B", label: "متوسطة" },
      { w: "75%", color: "#3B82F6", label: "جيدة" },
      { w: "100%", color: "#10B981", label: "قوية جداً" },
    ];
    return score > 0 ? levels[score - 1] : null;
  };

  const strength = getStrength(passwordValue);

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");
    const result = await registerAction(data);
    if (!result.success) {
      setServerError(result.error || "حدث خطأ");
      return;
    }
    setNeedsVerification(result.data?.requiresVerification ?? false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EEF1FF] via-[#F8FAFC] to-[#FFF7ED] px-4">
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-10 text-center max-w-md w-full">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-black text-secondary mb-2">تم إنشاء حسابك بنجاح!</h2>
          {needsVerification ? (
            <>
              <p className="text-sm text-gray-500 mb-6">
                أرسلنا بريداً إلكترونياً للتحقق من حسابك. يرجى فتح بريدك الإلكتروني والضغط على رابط التأكيد.
              </p>
              <Link href="/login" className="btn btn-primary inline-flex">تسجيل الدخول</Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">مرحباً بك في متاجر زون! يمكنك الآن تسجيل الدخول.</p>
              <Link href="/login" className="btn btn-primary inline-flex">تسجيل الدخول</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EEF1FF] via-[#F8FAFC] to-[#FFF7ED] px-4 py-10">
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 w-full max-w-[920px] grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* ── Left panel (same as login) ── */}
        <div className="bg-gradient-to-br from-primary to-primary-light p-10 text-white hidden md:flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-14 -right-14 w-52 h-52 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/8 rounded-full" />
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🛍️</div>
              <div>
                <div className="font-black text-base">متاجر زون</div>
                <div className="text-xs text-white/70">Mtajer Zone</div>
              </div>
            </Link>
            <h2 className="text-3xl font-black leading-snug mb-3">أنشئ متجرك الآن 🚀</h2>
            <p className="text-sm text-white/80 leading-relaxed mb-8">
              سجّل مجاناً وابدأ رحلتك مع منصة متاجر زون. 14 يوم تجربة مجانية بدون بطاقة ائتمان.
            </p>
            <div className="flex flex-col gap-3">
              {["إنشاء متجرك في دقائق","إضافة منتجات بسهولة","طلبات مباشرة على واتساب","دعم فني متواصل"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</div>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 flex gap-6">
            {[["14 يوم","مجاناً"],["لا","عمولات"],["دعم","24/7"]].map(([val, lbl]) => (
              <div key={lbl}><div className="text-xl font-black">{val}</div><div className="text-xs text-white/60">{lbl}</div></div>
            ))}
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="p-8 md:p-10 overflow-y-auto max-h-screen">
          <div className="flex bg-gray-100 rounded-[10px] p-1 mb-6">
            <Link href="/login" className="flex-1 py-2.5 text-gray-400 font-bold text-sm text-center">تسجيل الدخول</Link>
            <span className="flex-1 py-2.5 rounded-[8px] bg-white text-secondary font-bold text-sm text-center shadow-sm">إنشاء حساب</span>
          </div>

          <h2 className="text-xl font-black text-secondary mb-1">أنشئ حسابك الآن 🚀</h2>
          <p className="text-sm text-gray-400 mb-5">ابدأ مجاناً لمدة 14 يوم</p>

          {serverError && (
            <div className="bg-danger-light text-danger text-sm rounded-[10px] px-4 py-3 mb-4 border border-red-100">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="form-label">الاسم الأول *</label>
                <input type="text" {...register("firstName")}
                  className={cn("form-input", errors.firstName && "border-danger")}
                  placeholder="أحمد" />
                {errors.firstName && <span className="text-danger text-xs">{errors.firstName.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="form-label">الاسم الأخير *</label>
                <input type="text" {...register("lastName")}
                  className={cn("form-input", errors.lastName && "border-danger")}
                  placeholder="محمد" />
                {errors.lastName && <span className="text-danger text-xs">{errors.lastName.message}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label">البريد الإلكتروني *</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                <input type="email" {...register("email")}
                  className={cn("form-input pr-10", errors.email && "border-danger")}
                  placeholder="example@email.com" dir="ltr" />
              </div>
              {errors.email && <span className="text-danger text-xs">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label">رقم الهاتف (واتساب) *</label>
              <input type="tel" {...register("phone")}
                className={cn("form-input", errors.phone && "border-danger")}
                placeholder="01234567890" dir="ltr" />
              {errors.phone && <span className="text-danger text-xs">{errors.phone.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label">كلمة المرور *</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password")}
                  className={cn("form-input pr-10 pl-10", errors.password && "border-danger")}
                  placeholder="8 أحرف على الأقل"
                />
                <button type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordValue && (
                <div>
                  <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: strength?.w || "0%", backgroundColor: strength?.color || "#ccc" }} />
                  </div>
                  {strength && <span className="text-xs mt-0.5" style={{ color: strength.color }}>قوة كلمة المرور: {strength.label}</span>}
                </div>
              )}
              {errors.password && <span className="text-danger text-xs">{errors.password.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label">تأكيد كلمة المرور *</label>
              <input type="password" {...register("confirmPassword")}
                className={cn("form-input", errors.confirmPassword && "border-danger")}
                placeholder="••••••••" />
              {errors.confirmPassword && <span className="text-danger text-xs">{errors.confirmPassword.message}</span>}
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" {...register("acceptTerms")}
                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer flex-shrink-0" />
              <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
                أوافق على{" "}
                <Link href="/terms" className="text-primary hover:underline">شروط الاستخدام</Link>{" "}
                و<Link href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
              </label>
            </div>
            {errors.acceptTerms && <span className="text-danger text-xs -mt-2">{errors.acceptTerms.message}</span>}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? "جاري الإنشاء..." : "إنشاء الحساب مجاناً"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
