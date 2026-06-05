import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `إنشاء حساب | ${APP_NAME}`,
  description: "أنشئ حسابك في منصة متاجر زون مجاناً",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
