import type { Metadata } from "next";
import { verifyEmailAction } from "@/actions/auth.actions";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `تأكيد البريد الإلكتروني | ${APP_NAME}`,
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;

  if (!params.token) {
    return <VerifyResult success={false} message="رابط التحقق غير صحيح" />;
  }

  const result = await verifyEmailAction(params.token);
  return <VerifyResult success={result.success} message={result.message || result.error || ""} />;
}

function VerifyResult({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center max-w-md w-full shadow-md">
        <div className="text-5xl mb-4">{success ? "✅" : "❌"}</div>
        <h1 className="text-xl font-black text-secondary mb-3">
          {success ? "تم التحقق بنجاح!" : "فشل التحقق"}
        </h1>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {success ? (
            <Link href="/login" className="btn btn-primary">
              تسجيل الدخول
            </Link>
          ) : (
            <Link href="/login" className="btn btn-outline">
              إعادة المحاولة
            </Link>
          )}
          <Link href="/" className="btn btn-outline">الرئيسية</Link>
        </div>
      </div>
    </div>
  );
}
