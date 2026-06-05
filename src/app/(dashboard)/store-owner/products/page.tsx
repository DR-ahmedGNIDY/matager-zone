import { requireStoreOwner } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { listStoreProducts, getProductCategories } from "@/services/product.service";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ProductsManager from "@/components/dashboard/store-owner/ProductsManager";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إدارة المنتجات | متاجر زون" };

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; category?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const [user, sp] = await Promise.all([requireStoreOwner(), searchParams]);

  const store = await db.store.findFirst({
    where: { ownerId: user.id, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!store) redirect("/dashboard/store-owner/create");

  const [{ products, total }, categories] = await Promise.all([
    listStoreProducts(store.id, {
      search:     sp.search,
      status:     sp.status,
      categoryId: sp.category,
      page:       sp.page ? parseInt(sp.page) : 1,
    }),
    getProductCategories(store.id),
  ]);

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
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-[24px] font-black text-secondary">📦 إدارة المنتجات</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">{total} منتج في متجرك</p>
            </div>
            <Link href="/dashboard/store-owner/products/new"
              className="btn btn-primary no-underline flex items-center gap-2">
              ➕ إضافة منتج جديد
            </Link>
          </div>
          <ProductsManager
            products={products}
            categories={categories}
            total={total}
            storeId={store.id}
          />
        </div>
      </main>
    </div>
  );
}
