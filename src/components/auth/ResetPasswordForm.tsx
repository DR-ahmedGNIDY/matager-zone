"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema, type ResetPasswordInput } from "@/validators/auth";
import { resetPasswordAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ResetPasswordInput>({
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: { token },
    });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError("");
    const result = await resetPasswordAction(data);
    if (!result.success) { setServerError(result.error || "حدث خطأ"); return; }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-[24px] shadow-md p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-black text-secondary mb-2">تم تغيير كلمة المرور!</h2>
          <p className="text-sm text-gray-500">جاري تحويلك لصفحة تسجيل الدخول...</p>
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
        <h2 className="text-xl font-black text-secondary mb-1">إعادة تعيين كلمة المرور</h2>
        <p className="text-sm text-gray-400 mb-6">أدخل كلمة مرور جديدة لحسابك</p>

        {serverError && (
          <div className="bg-danger-light text-danger text-sm rounded-[10px] px-4 py-3 mb-4">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input type="hidden" {...register("token")} />

          <div className="flex flex-col gap-1.5">
            <label className="form-label">كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                {...register("password")}
                className={cn("form-input pl-10", errors.password && "border-danger")}
                placeholder="8 أحرف على الأقل"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-danger text-xs">{errors.password.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="form-label">تأكيد كلمة المرور</label>
            <input type="password" {...register("confirmPassword")}
              className={cn("form-input", errors.confirmPassword && "border-danger")}
              placeholder="••••••••" />
            {errors.confirmPassword && <span className="text-danger text-xs">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
          </button>
        </form>
      </div>
    </div>
  );
}
