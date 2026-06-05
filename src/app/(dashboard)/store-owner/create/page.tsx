import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-helpers";
import Navbar from "@/components/layout/Navbar";
import StoreWizard from "@/components/store-wizard/StoreWizard";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "إنشاء متجر جديد | متاجر زون" };

export default async function CreateStorePage() {
  const [, session] = await Promise.all([requireAuth(), auth()]);
  return (
    <>
      <Navbar session={session} />
      <div className="max-w-[1060px] mx-auto px-6 py-5">
        <Breadcrumb items={[
          { label: "الرئيسية", href: "/" },
          { label: "إنشاء متجر جديد" },
        ]} />
      </div>
      <StoreWizard />
    </>
  );
}
