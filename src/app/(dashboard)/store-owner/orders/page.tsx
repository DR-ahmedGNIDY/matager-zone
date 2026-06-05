import { requireStoreOwner } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import OrdersManager from "@/components/dashboard/store-owner/OrdersManager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الطلبات | متاجر زون" };

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const [user, sp] = await Promise.all([requireStoreOwner(), searchParams]);

  const store = await db.store.findFirst({
    where: { ownerId: user.id, deletedAt: null },
    select: { id: true, name: true, whatsappNumber: true, countryCode: true },
  });
  if (!store) redirect("/dashboard/store-owner/create");

  const page    = Math.max(1, parseInt(sp.page || "1"));
  const take    = 20;
  const skip    = (page - 1) * take;
  const where   = {
    storeId: store.id,
    ...(sp.status ? { status: sp.status as "NEW" | "VIEWED" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" } : {}),
  };

  const [orders, total, newCount] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true, orderNumber: true, status: true,
        totalAmountInCents: true, itemCount: true,
        whatsappMessage: true, notes: true,
        createdAt: true, updatedAt: true,
        customer: { select: { id: true, name: true, email: true } },
        items: {
          select: {
            id: true, productName: true, quantity: true,
            priceInCents: true, selectedVariants: true,
          },
        },
      },
    }),
    db.order.count({ where }),
    db.order.count({ where: { storeId: store.id, status: "NEW" } }),
  ]);

  const userForSidebar = { name: user.name, email: user.email ?? "", image: user.image, role: user.role };

  return (
    <div className="flex min-h-screen">
      <div className="w-[240px] flex-shrink-0 hidden md:block">
        <DashboardSidebar
          links={[
            { href: "/dashboard/store-owner",           icon: "📊", label: "لوحة التحكم" },
            { href: "/dashboard/store-owner/products",   icon: "📦", label: "المنتجات" },
            { href: "/dashboard/store-owner/orders",     icon: "🛒", label: "الطلبات", badge: newCount || undefined },
            { href: "/dashboard/store-owner/settings",   icon: "⚙️", label: "إعدادات المتجر" },
          ]}
          user={userForSidebar}
          storeName={store.name}
          variant="store"
        />
      </div>
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[24px] font-black text-secondary">🛒 الطلبات</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {total} طلب {newCount > 0 && <span className="text-danger font-bold">· {newCount} جديد</span>}
              </p>
            </div>
          </div>
          <OrdersManager
            orders={orders}
            total={total}
            page={page}
            storeWaNumber={(store.countryCode || "20") + store.whatsappNumber}
          />
        </div>
      </main>
    </div>
  );
}
