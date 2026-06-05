import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `إعادة تعيين كلمة المرور | ${APP_NAME}`,
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  if (!params.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-secondary mb-2">رابط غير صحيح</h1>
          <p className="text-gray-500">الرابط الذي استخدمته غير صحيح أو منتهي الصلاحية.</p>
          <a href="/forgot-password" className="btn btn-primary mt-4 inline-flex">
            اطلب رابطاً جديداً
          </a>
        </div>
      </div>
    );
  }
  return <ResetPasswordForm token={params.token} />;
}
