import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getAdminStats, listCategories, listPendingReviews, getPlatformSettings, getRecentAuditLogs } from "@/services/admin.service";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AdminOverview from "@/components/dashboard/admin/AdminOverview";
import AdminStoresTab from "@/components/dashboard/admin/AdminStoresTab";
import AdminUsersTab from "@/components/dashboard/admin/AdminUsersTab";
import AdminCategoriesTab from "@/components/dashboard/admin/AdminCategoriesTab";
import AdminReviewsTab from "@/components/dashboard/admin/AdminReviewsTab";
import AdminSettingsTab from "@/components/dashboard/admin/AdminSettingsTab";
import type { Metadata } from "next";
import type { StoreStatus } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "لوحة الإدارة | متاجر زون" };

type AdminTab = "overview" | "pending" | "stores" | "users" | "categories" | "reviews" | "settings";
interface PageProps { searchParams: Promise<{ tab?: string; page?: string; search?: string; status?: string }> }

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const [user, sp] = await Promise.all([requireAdmin(), searchParams]);
  const tab  = (sp.tab  || "overview") as AdminTab;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const PAGE_SIZE = 20;

  // Stats always loaded (used in sidebar badge)
  const stats = await getAdminStats();

  // Tab-specific data
  let tabData: Record<string, unknown> = {};

  if (tab === "overview") {
    const recentActivity = await getRecentAuditLogs(10);
    const newStores = await db.store.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, status: true, createdAt: true,
        owner: { select: { name: true, email: true } } },
    });
    tabData = { recentActivity, newStores };
  }

  if (tab === "pending") {
    const stores = await db.store.findMany({
      where: { status: "PENDING", deletedAt: null },
      orderBy: { createdAt: "asc" }, // oldest first — review in order
      take: 50,
      include: {
        owner:    { select: { id: true, name: true, email: true, phone: true } },
        category: { select: { nameAr: true, emoji: true } },
        _count:   { select: { products: true } },
      },
    });
    tabData = { stores };
  }

  if (tab === "stores") {
    const where = {
      deletedAt: null,
      ...(sp.search ? { name: { contains: sp.search, mode: "insensitive" as const } } : {}),
      ...(sp.status ? { status: sp.status as StoreStatus } : {}),
    };
    const [stores, total] = await Promise.all([
      db.store.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          owner:    { select: { name: true, email: true } },
          category: { select: { nameAr: true, emoji: true } },
          _count:   { select: { products: true, orders: true, followers: true } },
        },
      }),
      db.store.count({ where }),
    ]);
    tabData = { stores, total, page };
  }

  if (tab === "users") {
    const where = {
      deletedAt: null,
      ...(sp.search ? {
        OR: [
          { name:  { contains: sp.search, mode: "insensitive" as const } },
          { email: { contains: sp.search, mode: "insensitive" as const } },
        ],
      } : {}),
    };
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true, name: true, email: true, role: true,
          isActive: true, isOwner: true, createdAt: true,
          _count: { select: { stores: true, orders: true } },
        },
      }),
      db.user.count({ where }),
    ]);
    tabData = { users, total, page };
  }

  if (tab === "categories") {
    tabData = { categories: await listCategories() };
  }

  if (tab === "reviews") {
    tabData = { reviews: await listPendingReviews() };
  }

  if (tab === "settings") {
    tabData = { settings: await getPlatformSettings() };
  }

  const TABS = [
    { id: "overview",   icon: "📊", label: "نظرة عامة" },
    { id: "pending",    icon: "⏳", label: "قيد المراجعة", badge: stats.pendingStores || undefined },
    { id: "stores",     icon: "🏪", label: "المتاجر" },
    { id: "users",      icon: "👥", label: "المستخدمون" },
    { id: "categories", icon: "🏷️", label: "التصنيفات" },
    { id: "reviews",    icon: "⭐", label: "التقييمات" },
    { id: "settings",   icon: "⚙️", label: "إعدادات النظام" },
  ];

  const userForSidebar = { name: user.name, email: user.email ?? "", image: user.image, role: user.role };

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      {/* Sidebar */}
      <div className="w-[240px] flex-shrink-0 hidden md:flex flex-col min-h-screen">
        <DashboardSidebar
          links={TABS.map((t) => ({
            href:  `/dashboard/admin?tab=${t.id}`,
            icon:  t.icon,
            label: t.label,
            badge: t.badge,
          }))}
          user={userForSidebar}
          variant="admin"
        />
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur border-b border-white/10 px-6 py-3">
          <div className="max-w-[1100px] mx-auto flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-[18px] font-black text-white">
                {TABS.find((t) => t.id === tab)?.icon}{" "}
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
              <p className="text-[11px] text-gray-500">مرحباً {user.name}</p>
            </div>
            {/* Mobile tab selector */}
            <div className="flex gap-1.5 overflow-x-auto md:hidden">
              {TABS.map((t) => (
                <a key={t.id} href={`/dashboard/admin?tab=${t.id}`}
                  className={`relative px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold whitespace-nowrap no-underline ${
                    tab === t.id ? "bg-primary text-white" : "bg-white/8 text-gray-400"
                  }`}>
                  {t.icon}
                  {t.badge && t.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                      {t.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 py-7">
          {tab === "overview"   && <AdminOverview    stats={stats} recentActivity={tabData.recentActivity as Awaited<ReturnType<typeof getRecentAuditLogs>>} newStores={tabData.newStores as Parameters<typeof AdminOverview>[0]["newStores"]} />}
          {tab === "pending"    && <AdminStoresTab   stores={tabData.stores as Parameters<typeof AdminStoresTab>[0]["stores"]} mode="pending" />}
          {tab === "stores"     && <AdminStoresTab   stores={tabData.stores as Parameters<typeof AdminStoresTab>[0]["stores"]} total={tabData.total as number} page={tabData.page as number} mode="all" />}
          {tab === "users"      && <AdminUsersTab    users={tabData.users  as Parameters<typeof AdminUsersTab>[0]["users"]}  total={tabData.total as number} page={tabData.page as number} />}
          {tab === "categories" && <AdminCategoriesTab categories={tabData.categories as Parameters<typeof AdminCategoriesTab>[0]["categories"]} />}
          {tab === "reviews"    && <AdminReviewsTab  reviews={tabData.reviews as Parameters<typeof AdminReviewsTab>[0]["reviews"]} />}
          {tab === "settings"   && <AdminSettingsTab settings={tabData.settings as Parameters<typeof AdminSettingsTab>[0]["settings"]} />}
        </div>
      </main>
    </div>
  );
}
