import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreSearchBar from "@/components/stores/StoreSearchBar";
import StoreFilters from "@/components/stores/StoreFilters";
import StoreCard from "@/components/common/StoreCard";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import Link from "next/link";
import SortSelect from "@/components/stores/SortSelect";
import { APP_NAME } from "@/lib/constants";

export function generateMetadata(): Metadata {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title:       `دليل المتاجر | ${APP_NAME}`,
    description: "اكتشف مئات المتاجر الإلكترونية وتسوق بسهولة. الطلبات تصل مباشرة عبر واتساب — بدون دفع مسبق.",
    alternates:  { canonical: `${base}/stores` },
    openGraph: {
      title:       `دليل المتاجر | ${APP_NAME}`,
      description: "اكتشف مئات المتاجر وتسوق عبر واتساب.",
      url:         `${base}/stores`,
      siteName:    APP_NAME,
    },
  };
}

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{
    search?: string; category?: string; country?: string;
    rating?: string; verified?: string; featured?: string;
    sort?: string; page?: string;
  }>;
}

async function getStores(params: Awaited<PageProps["searchParams"]>) {
  const page  = Math.max(1, parseInt(params.page || "1"));
  const skip  = (page - 1) * PAGE_SIZE;
  const where: Record<string, unknown> = { status: "ACTIVE", deletedAt: null };

  if (params.search)   where.OR = [
    { name: { contains: params.search, mode: "insensitive" } },
    { description: { contains: params.search, mode: "insensitive" } },
  ];
  if (params.category) where.category = { slug: params.category };
  if (params.country)  where.country  = params.country;
  if (params.verified === "true") where.isVerified = true;
  if (params.featured === "true") where.isFeatured = true;
  if (params.rating)   where.averageRating = { gte: parseInt(params.rating) };

  const orderBy: Record<string, unknown> =
    params.sort === "rating"   ? { averageRating: "desc" } :
    params.sort === "newest"   ? { createdAt: "desc" }     :
    params.sort === "products" ? { totalProducts: "desc" } :
                                 { totalOrders: "desc" };

  const [stores, total] = await Promise.all([
    db.store.findMany({
      where, orderBy, skip, take: PAGE_SIZE,
      select: {
        id: true, name: true, slug: true, logo: true, cover: true,
        description: true, primaryColor: true, isVerified: true, isFeatured: true,
        whatsappNumber: true, countryCode: true, city: true, country: true,
        averageRating: true,
        category: { select: { nameAr: true, emoji: true } },
        _count: { select: { products: true, followers: true } },
      },
    }),
    db.store.count({ where }),
  ]);

  return { stores, total, totalPages: Math.ceil(total / PAGE_SIZE), page };
}

export default async function StoresPage({ searchParams }: PageProps) {
  const [params, session] = await Promise.all([searchParams, auth()]);
  const { stores, total, totalPages, page } = await getStores(params);

  const QUICK_FILTERS = [
    { label: "⭐ الكل",           href: "/stores" },
    { label: "🏆 المتاجر المميزة", href: "/stores?featured=true" },
    { label: "✅ الموثقة",        href: "/stores?verified=true" },
    { label: "🆕 الأحدث",         href: "/stores?sort=newest" },
    { label: "🔥 الأكثر شعبية",   href: "/stores?sort=popular" },
  ];

  return (
    <>
      <Navbar session={session} />

      {/* Hero search area */}
      <div
        className="px-6 py-12"
        style={{ background: "linear-gradient(135deg,#EEF1FF 0%,#F8FAFC 60%,#FFF7ED 100%)" }}
      >
        <div className="max-w-[1280px] mx-auto">
          <Breadcrumb items={[{ label: "الرئيسية", href: "/" }, { label: "دليل المتاجر" }]} />
          <h1 className="text-[clamp(24px,3vw,36px)] font-black text-secondary mb-2">🏪 دليل المتاجر</h1>
          <p className="text-[15px] text-gray-500 mb-6">اكتشف مئات المتاجر وتسوق بسهولة عبر واتساب</p>
          <StoreSearchBar />
          <div className="flex gap-2 mt-4 flex-wrap">
            {QUICK_FILTERS.map((f) => (
              <Link key={f.href} href={f.href}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-primary hover:border-primary hover:text-white text-gray-600 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all no-underline">
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-7 items-start">

        {/* Sidebar */}
        <div className="lg:sticky lg:top-[84px]">
          <StoreFilters />
        </div>

        {/* Content */}
        <div>
          {/* Featured banner */}
          <div
            className="rounded-[24px] px-7 py-6 flex items-center gap-5 mb-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#4F6BFF,#6B83FF)", color: "#fff" }}
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/8 rounded-full" />
            <span className="text-4xl flex-shrink-0">⭐</span>
            <div className="flex-1">
              <div className="text-[18px] font-black mb-1">افتح متجرك المميز الآن</div>
              <div className="text-[13px] opacity-80">ظهور أعلى في نتائج البحث وباج مميز لمتجرك</div>
            </div>
            <Link href="/dashboard/store-owner/create"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 rounded-[10px] text-[13px] font-bold transition-all no-underline flex-shrink-0">
              ابدأ الآن ←
            </Link>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="text-[14px] text-gray-500">
              عرض <strong className="text-secondary font-black">{total.toLocaleString("ar-EG")}</strong> متجر
            </div>
            <div className="flex items-center gap-2.5">
              <SortSelect defaultValue={params.sort || "popular"} />
            </div>
          </div>

          {/* Store grid */}
          {stores.length === 0 ? (
            <EmptyState
              icon="🏪"
              title="لا توجد متاجر مطابقة"
              description="جرب تغيير معايير البحث أو الفلاتر"
              action={{ label: "عرض جميع المتاجر", href: "/stores" }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4.5">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} variant="grid" />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={() => {}} />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
