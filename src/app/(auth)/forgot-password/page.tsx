import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `نسيت كلمة المرور | ${APP_NAME}`,
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
