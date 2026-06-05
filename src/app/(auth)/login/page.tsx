import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `تسجيل الدخول | ${APP_NAME}`,
  description: "سجّل دخولك إلى منصة متاجر زون",
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return (
    <LoginForm
      callbackUrl={params.callbackUrl}
      errorParam={params.error}
    />
  );
}
