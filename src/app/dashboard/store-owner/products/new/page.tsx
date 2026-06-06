import { requireStoreOwner } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getProductCategories } from "@/services/product.service";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ProductForm from "@/components/dashboard/store-owner/ProductForm";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إضافة منتج | متاجر زون" };

export default async function NewProductPage() {
  const user = await requireStoreOwner();
  const store = await db.store.findFirst({
    where: { ownerId: user.id, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!store) redirect("/dashboard/store-owner/create");

  const categories = await getProductCategories(store.id);
  const userForSidebar = { name: user.name, email: user.email ?? "", image: user.image, role: user.role };

  return (
    <div className="flex min-h-screen">
      <div className="w-[240px] flex-shrink-0 hidden md:block">
        <DashboardSidebar
          links={[
            { href: "/dashboard/store-owner",           icon: "📊", label: "لوحة التحكم" },
            { href: "/dashboard/store-owner/products",   icon: "📦", label: "المنتجات" },
            { href: "/dashboard/store-owner/orders",     icon: "🛒", label: "الطلبات" },
            { href: "/dashboard/store-owner/settings",   icon: "⚙️", label: "إعدادات المتجر" },
          ]}
          user={userForSidebar}
          storeName={store.name}
          variant="store"
        />
      </div>
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-[860px] mx-auto px-6 py-8">
          <Breadcrumb items={[
            { label: "لوحة التحكم", href: "/dashboard/store-owner" },
            { label: "المنتجات", href: "/dashboard/store-owner/products" },
            { label: "إضافة منتج جديد" },
          ]} />
          <h1 className="text-[22px] font-black text-secondary mb-6 mt-2">➕ إضافة منتج جديد</h1>
          <div className="bg-white rounded-[24px] border border-gray-100 p-6">
            <ProductForm mode="create" categories={categories} />
          </div>
        </div>
      </main>
    </div>
  );
}
