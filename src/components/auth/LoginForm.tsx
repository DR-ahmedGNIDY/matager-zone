"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginSchema, type LoginInput } from "@/validators/auth";
import { loginAction, googleLoginAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginFormProps {
  callbackUrl?: string;
  errorParam?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  AccountSuspended: "حسابك موقوف. تواصل مع الدعم.",
  EmailNotVerified: "يرجى تأكيد بريدك الإلكتروني أولاً.",
  AccountLocked: "حسابك مغلق مؤقتاً بسبب محاولات متعددة. حاول بعد 15 دقيقة.",
  OAuthCallback: "حدث خطأ مع تسجيل الدخول بجوجل. حاول مرة أخرى.",
  default: "حدث خطأ. حاول مرة أخرى.",
};

export default function LoginForm({ callbackUrl, errorParam }: LoginFormProps) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState(
    errorParam ? (ERROR_MESSAGES[errorParam] ?? ERROR_MESSAGES.default) : ""
  );
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    const result = await loginAction(data, callbackUrl);
    if (!result.success) {
      setServerError(result.error || "حدث خطأ");
      return;
    }
    router.push(callbackUrl || "/");
    router.refresh();
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    await googleLoginAction();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EEF1FF] via-[#F8FAFC] to-[#FFF7ED] px-4 py-10">
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 w-full max-w-[920px] grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* ── Left: Branding panel ── */}
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
            <h2 className="text-3xl font-black leading-snug mb-3">
              ابدأ رحلة البيع<br />الذكي عبر واتساب
            </h2>
            <p className="text-sm text-white/80 leading-relaxed mb-8">
              انضم لمئات التجار على منصة متاجر زون وابدأ في استقبال الطلبات مباشرة عبر واتساب.
            </p>
            <div className="flex flex-col gap-3">
              {["متجر إلكتروني احترافي خاص بك","طلبات مباشرة عبر واتساب","لوحة تحكم متكاملة","تحليلات ومتابعة الأداء"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex gap-6">
            {[["500+","متجر نشط"],["50K+","منتج"],["1M+","مبيعات"]].map(([val, lbl]) => (
              <div key={lbl}>
                <div className="text-2xl font-black">{val}</div>
                <div className="text-xs text-white/60">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="p-8 md:p-10">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-[10px] p-1 mb-7">
            <span className="flex-1 py-2.5 rounded-[8px] bg-white text-secondary font-bold text-sm text-center shadow-sm">
              تسجيل الدخول
            </span>
            <Link href="/register" className="flex-1 py-2.5 text-gray-400 font-bold text-sm text-center">
              إنشاء حساب
            </Link>
          </div>

          <h2 className="text-xl font-black text-secondary mb-1">مرحباً بعودتك 👋</h2>
          <p className="text-sm text-gray-400 mb-6">سجّل دخولك للوصول لحسابك</p>

          {serverError && (
            <div className="bg-danger-light text-danger text-sm rounded-[10px] px-4 py-3 mb-5 border border-red-100">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="form-label">البريد الإلكتروني</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">✉️</span>
                <input
                  type="email"
                  {...register("email")}
                  className={cn("form-input pr-10", errors.email && "border-danger")}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
              {errors.email && <span className="text-danger text-xs">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="form-label">كلمة المرور</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password")}
                  className={cn("form-input pr-10 pl-10", errors.password && "border-danger")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-danger text-xs">{errors.password.message}</span>}
            </div>

            <Link href="/forgot-password" className="text-xs text-primary self-end -mt-2 hover:underline">
              نسيت كلمة المرور؟
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-block"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">أو</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-gray-200 rounded-[10px] text-sm font-semibold text-secondary hover:border-primary hover:bg-primary-ultra transition-all disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            المتابعة بحساب Google
          </button>

          <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            بتسجيل الدخول، أنت توافق على{" "}
            <Link href="/terms" className="text-primary hover:underline">شروط الاستخدام</Link>{" "}
            و<Link href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
