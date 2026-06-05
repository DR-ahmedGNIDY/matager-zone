"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/validators/auth";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError("");
    const result = await forgotPasswordAction(data);
    if (!result.success) { setServerError(result.error || "حدث خطأ"); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-[24px] shadow-md border border-gray-100 p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-black text-secondary mb-2">تحقق من بريدك</h2>
          <p className="text-sm text-gray-500 mb-6">
            إذا كان الحساب موجوداً، ستصل رسالة إعادة تعيين كلمة المرور خلال دقائق.
          </p>
          <Link href="/login" className="btn btn-primary inline-flex">العودة لتسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-[24px] shadow-md border border-gray-100 p-8 w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🛍️</span>
          <span className="font-black text-primary">متاجر زون</span>
        </Link>
        <h2 className="text-xl font-black text-secondary mb-1">نسيت كلمة المرور؟</h2>
        <p className="text-sm text-gray-400 mb-6">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>

        {serverError && (
          <div className="bg-danger-light text-danger text-sm rounded-[10px] px-4 py-3 mb-4">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="form-label">البريد الإلكتروني</label>
            <input type="email" {...register("email")}
              className={cn("form-input", errors.email && "border-danger")}
              placeholder="example@email.com" dir="ltr" />
            {errors.email && <span className="text-danger text-xs">{errors.email.message}</span>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
          </button>
        </form>

        <Link href="/login" className="text-sm text-gray-400 hover:text-primary text-center block mt-4">
          ← العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
