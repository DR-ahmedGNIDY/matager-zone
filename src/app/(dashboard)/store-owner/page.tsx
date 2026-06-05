import { requireStoreOwner } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StatCard from "@/components/dashboard/StatCard";
import OrdersTable from "@/components/dashboard/OrdersTable";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";


export const metadata: Metadata = { title: "لوحة تحكم المتجر | متاجر زون" };

export default async function StoreOwnerDashboard() {
  const user = await requireStoreOwner();

  const store = await db.store.findFirst({
    where: { ownerId: user.id, deletedAt: null },
    include: {
      _count: { select: { products: true, orders: true, followers: true } },
    },
  });

  if (!store) redirect("/dashboard/store-owner/create");

  // Fetch dashboard data
  const [recentOrders, topProducts, orders] = await Promise.all([
    db.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, orderNumber: true, status: true,
        totalAmountInCents: true, itemCount: true, createdAt: true,
      },
    }),
    db.product.findMany({
      where: { storeId: store.id, status: "ACTIVE", deletedAt: null },
      orderBy: { totalOrders: "desc" },
      take: 5,
      select: {
        id: true, name: true, priceInCents: true, totalOrders: true,
        stock: true, status: true, images: { take: 1 },
      },
    }),
    db.order.count({ where: { storeId: store.id } }),
  ]);

  const totalRevenue = recentOrders.reduce((s, o) => s + o.totalAmountInCents, 0);
  const newOrders = recentOrders.filter((o) => o.status === "NEW").length;

  // Chart data (last 7 days mock — real data in Phase 6)
  const chartData = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"].map((day, i) => ({
    name: day, value: Math.floor(Math.random() * 15) + 2,
  }));


  const userForSidebar = { name: user.name, email: user.email ?? "", image: user.image, role: user.role };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0 hidden md:block">
        <DashboardSidebar
          links={[
            { href: "/dashboard/store-owner",           icon: "📊", label: "لوحة التحكم" },
            { href: "/dashboard/store-owner/products",   icon: "📦", label: "المنتجات" },
            { href: "/dashboard/store-owner/orders",     icon: "🛒", label: "الطلبات", badge: newOrders },
            { href: "/dashboard/store-owner/settings",   icon: "⚙️", label: "إعدادات المتجر" },
          ]}
          user={userForSidebar}
          storeName={store.name}
          variant="store"
        />
      </div>

      {/* Main */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-[1100px] mx-auto px-6 py-8">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            <StatCard icon="👁️" label="الزيارات هذا الشهر" value={store.totalVisits.toLocaleString("ar-EG")} change={12} color="primary" />
            <StatCard icon="🛒" label="إجمالي الطلبات" value={store._count.orders} change={8} color="success" />
            <StatCard icon="⭐" label="التقييم" value={store.averageRating > 0 ? store.averageRating.toFixed(1) : "—"} color="warning" />
            <StatCard icon="👥" label="المتابعون" value={store.totalFollowers.toLocaleString("ar-EG")} change={5} color="primary" />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
            {[
              { icon: "➕", label: "إضافة منتج",     href: "/dashboard/store-owner/products/new" },
              { icon: "📦", label: "المنتجات",        href: "/dashboard/store-owner/products" },
              { icon: "🛒", label: "الطلبات",          href: "/dashboard/store-owner/orders", badge: newOrders },
              { icon: "⚙️", label: "الإعدادات",       href: "/dashboard/store-owner/settings" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="relative bg-white border border-gray-100 rounded-[16px] px-4 py-4 text-center hover:shadow-md hover:border-primary transition-all no-underline group">
                <div className="text-2xl mb-1.5">{a.icon}</div>
                <div className="text-[12px] font-bold text-secondary group-hover:text-primary">{a.label}</div>
                {a.badge && a.badge > 0 && (
                  <span className="absolute top-2 right-2 bg-danger text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {a.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Top products */}
          <div className="bg-white rounded-[20px] border border-gray-100 p-5 mb-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-black text-secondary">📦 أكثر المنتجات طلباً</h3>
              <Link href="/dashboard/store-owner/products" className="text-[12px] text-primary hover:underline no-underline">إدارة المنتجات</Link>
            </div>
            <div className="flex flex-col gap-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-[13px] font-black text-gray-400 w-5">#{i + 1}</span>
                  <div className="w-9 h-9 bg-gray-100 rounded-[8px] flex items-center justify-center text-base overflow-hidden">
                    {p.images?.[0] ? <img src={p.images[0].url} className="w-full h-full object-contain" alt="" /> : "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-secondary truncate">{p.name}</div>
                    <div className="text-[11px] text-gray-400">{p.totalOrders} طلب</div>
                  </div>
                  <div className="text-[12px] font-black text-primary whitespace-nowrap">{(p.priceInCents / 100).toLocaleString("ar-EG")} ج.م</div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-[13px] mb-3">لا توجد منتجات بعد</p>
                  <Link href="/dashboard/store-owner/products/new" className="btn btn-primary btn-sm no-underline">إضافة منتج</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-[14px] font-black text-secondary">🛒 أحدث الطلبات</h3>
              <Link href="/dashboard/store-owner/orders" className="text-[12px] text-primary hover:underline no-underline">عرض الكل</Link>
            </div>
            <OrdersTable
  orders={recentOrders as any}
  emptyMessage="لا توجد طلبات بعد"
/>
          </div>
        </div>
      </main>
    </div>
  );
}
