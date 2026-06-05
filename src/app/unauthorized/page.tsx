import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "غير مصرح | متاجر زون" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-black text-secondary mb-2">غير مصرح</h1>
        <p className="text-gray-500 mb-6">ليس لديك صلاحية الوصول لهذه الصفحة.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn btn-primary">الرئيسية</Link>
          <Link href="/login" className="btn btn-outline">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
