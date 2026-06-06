import { requireStoreOwner } from "@/lib/auth-helpers";
import { getOwnerStore } from "@/services/store.service";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StoreSettingsForm from "@/components/dashboard/store-owner/StoreSettingsForm";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إعدادات المتجر | متاجر زون" };

export default async function StoreSettingsPage() {
  const user = await requireStoreOwner();
  const store = await getOwnerStore(user.id);
  if (!store) redirect("/dashboard/store-owner/create");

  const newOrdersBadge = await db.order.count({
    where: { storeId: store.id, status: "NEW" },
  });

  const userForSidebar = { name: user.name, email: user.email ?? "", image: user.image, role: user.role };

  return (
    <div className="flex min-h-screen">
      <div className="w-[240px] flex-shrink-0 hidden md:block">
        <DashboardSidebar
          links={[
            { href: "/dashboard/store-owner",           icon: "📊", label: "لوحة التحكم" },
            { href: "/dashboard/store-owner/products",   icon: "📦", label: "المنتجات" },
            { href: "/dashboard/store-owner/orders",     icon: "🛒", label: "الطلبات", badge: newOrdersBadge || undefined },
            { href: "/dashboard/store-owner/settings",   icon: "⚙️", label: "إعدادات المتجر" },
          ]}
          user={userForSidebar}
          storeName={store.name}
          variant="store"
        />
      </div>
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-[860px] mx-auto px-6 py-8">
          <h1 className="text-[24px] font-black text-secondary mb-6">⚙️ إعدادات المتجر</h1>
          <StoreSettingsForm
            store={{
              id:              store.id,
              name:            store.name,
              description:     store.description ?? "",
              whatsappNumber:  store.whatsappNumber,
              countryCode:     store.countryCode,
              welcomeMessage:  store.welcomeMessage ?? "",
              orderButtonText: store.orderButtonText,
              city:            store.city ?? "",
              country:         store.country ?? "",
              address:         store.address ?? "",
              primaryColor:    store.primaryColor,
              logo:            store.logo ?? null,
              cover:           store.cover ?? null,
              instagramUrl:    store.instagramUrl ?? "",
              tiktokUrl:       store.tiktokUrl ?? "",
              facebookUrl:     store.facebookUrl ?? "",
              twitterUrl:      store.twitterUrl ?? "",
              websiteUrl:      store.websiteUrl ?? "",
              seoTitle:        store.seoTitle ?? "",
              seoDescription:  store.seoDescription ?? "",
              slug:            store.slug,
              status:          store.status,
            }}
          />
        </div>
      </main>
    </div>
  );
}
