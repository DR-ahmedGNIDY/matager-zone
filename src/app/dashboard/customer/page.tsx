import { requireCustomer } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { OrderCard } from "@/components/dashboard/customer/OrderCard";
import { WishlistGrid } from "@/components/dashboard/customer/OrderCard";
import { FollowedStores } from "@/components/dashboard/customer/OrderCard";
import { EmptyState } from "@/components/common/EmptyState";
import type { Metadata } from "next";
import type { OrderStatus } from "@/types";
import NotificationsTab from "@/components/dashboard/customer/NotificationsTab";
import ProfileTab from "@/components/dashboard/customer/ProfileTab";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "حسابي | متاجر زون" };

type CustomerTab =
  | "orders"
  | "wishlist"
  | "followed"
  | "notifications"
  | "reviews"
  | "profile";

interface PageProps { searchParams: Promise<{ tab?: string }> }

export default async function CustomerDashboardPage({ searchParams }: PageProps) {
  const [user, sp] = await Promise.all([requireCustomer(), searchParams]);
  const tab = (sp.tab || "orders") as CustomerTab;

  // Fetch data based on active tab
  const [orders, wishlistItems, followedStores, notifications, customerReviews] = await Promise.all([
    db.order.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, orderNumber: true, status: true, totalAmountInCents: true,
        itemCount: true, createdAt: true, whatsappMessage: true,
        store: { select: { name: true, slug: true, whatsappNumber: true, countryCode: true } },
        items: {
          select: {
            id: true, productName: true, quantity: true,
            priceInCents: true, productImage: true,
          },
        },
      },
    }),
    db.wishlistItem.findMany({
      where: { wishlist: { userId: user.id } },
      include: {
        product: {
          select: {
            id: true, name: true, priceInCents: true, comparePriceInCents: true,
            images: { take: 1, select: { url: true, alt: true } },
            store: { select: { id: true, name: true, slug: true, whatsappNumber: true, countryCode: true } },
          },
        },
      },
    }),
    db.storeFollower.findMany({
      where: { userId: user.id },
      include: {
        store: {
          select: {
            id: true, name: true, slug: true, logo: true, cover: true, description: true,
            primaryColor: true, isVerified: true, isFeatured: true,
            whatsappNumber: true, countryCode: true, city: true, country: true,
            averageRating: true,
            category: { select: { nameAr: true, emoji: true } },
            _count: { select: { products: true, followers: true } },
          },
        },
      },
    }),
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, title: true, message: true, type: true, isRead: true, createdAt: true },
    }),
    db.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, reviewType: true, rating: true, comment: true,
        isApproved: true, createdAt: true,
        store:   { select: { id: true, name: true, slug: true } },
        product: { select: { id: true, name: true } },
      },
    }),
  ]);

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  // Profile data for profile tab
  const profileUser = {
    id:    user.id,
    name:  user.name,
    email: user.email ?? "",
    phone: null as string | null, // fetched lazily in ProfileTab
  };

  const TABS = [
    { id: "orders",        icon: "🛒", label: "طلباتي",              badge: orders.filter(o => o.status === "NEW").length },
    { id: "wishlist",      icon: "❤️", label: "المفضلة",             badge: wishlistItems.length },
    { id: "followed",      icon: "🏪", label: "المتاجر المتابعة",   badge: followedStores.length },
    { id: "notifications", icon: "🔔", label: "الإشعارات",           badge: unreadNotifs },
    { id: "reviews",       icon: "⭐", label: "تقييماتي",             badge: customerReviews.length },
    { id: "profile",       icon: "👤", label: "بيانات الحساب",       badge: 0 },
  ];

  const userForSidebar = { name: user.name, email: user.email ?? "", image: user.image, role: user.role };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0 hidden md:block">
        <DashboardSidebar
          links={TABS.map((t) => ({ href: `/dashboard/customer?tab=${t.id}`, icon: t.icon, label: t.label, badge: t.badge || undefined }))}
          user={userForSidebar}
          variant="customer"
        />
      </div>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-[1000px] mx-auto px-6 py-8">

          {/* Mobile tab bar */}
          <div className="md:hidden overflow-x-auto mb-6">
            <div className="flex gap-2 pb-1">
              {TABS.map((t) => (
                <a key={t.id} href={`/dashboard/customer?tab=${t.id}`}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap no-underline transition-all ${
                    tab === t.id ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
                  }`}>
                  {t.icon} {t.label}
                  {t.badge > 0 && <span className="bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full">{t.badge}</span>}
                </a>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {tab === "orders" && (
            <div>
              <h2 className="text-[22px] font-black text-secondary mb-5">🛒 طلباتي</h2>
              {orders.length === 0 ? (
                <EmptyState icon="🛒" title="لا توجد طلبات بعد"
                  description="ابدأ التسوق من متاجرنا واستقبل منتجاتك عبر واتساب"
                  action={{ label: "استكشف المتاجر", href: "/stores" }} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {orders.map((o) => (
                    <OrderCard key={o.id} order={{ ...o, status: o.status as OrderStatus }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "wishlist" && (
            <div>
              <h2 className="text-[22px] font-black text-secondary mb-5">❤️ المفضلة</h2>
              <WishlistGrid items={wishlistItems} />
            </div>
          )}

          {tab === "followed" && (
            <div>
              <h2 className="text-[22px] font-black text-secondary mb-5">🏪 المتاجر المتابعة</h2>
              <FollowedStores
  stores={followedStores.map((f) => ({
    ...f.store,
    city: f.store.city ?? null,
    country: f.store.country ?? null,
  }))}
/>
            </div>
          )}

          {tab === "notifications" && (
            <NotificationsTab notifications={notifications} unreadCount={unreadNotifs} />
          )}

          {tab === "reviews" && (
            <div>
              <h2 className="text-[22px] font-black text-secondary mb-5">⭐ تقييماتي</h2>
              {customerReviews.length === 0 ? (
                <EmptyState icon="⭐" title="لا توجد تقييمات بعد"
                  description="بعد إتمام طلب يمكنك تقييم المتجر أو المنتج" />
              ) : (
                <div className="flex flex-col gap-3">
                  {customerReviews.map((r) => (
                    <div key={r.id} className="bg-white rounded-[16px] border border-gray-100 p-5">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex gap-0.5 mb-1">
                            {"★★★★★".split("").map((s, i) => (
                              <span key={i} className={i < r.rating ? "text-accent" : "text-gray-200"}>{s}</span>
                            ))}
                          </div>
                          <div className="text-[13px] font-bold text-secondary">
                            {r.reviewType === "STORE"
                              ? r.store ? `متجر: ${r.store.name}` : "متجر"
                              : r.product ? `منتج: ${r.product.name}` : "منتج"}
                          </div>
                          {r.comment && <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">{r.comment}</p>}
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${r.isApproved ? "bg-success-light text-green-700" : "bg-warning-light text-amber-700"}`}>
                          {r.isApproved ? "✓ منشور" : "⏳ قيد المراجعة"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <ProfileTab user={profileUser} />
          )}
        </div>
      </main>
    </div>
  );
}
