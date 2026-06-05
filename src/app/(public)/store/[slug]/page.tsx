import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StoreProfileBar from "@/components/store/StoreProfileBar";
import StoreInfoSidebar from "@/components/store/StoreInfoSidebar";
import StoreProductsGrid from "@/components/store/StoreProductsGrid";
import ReviewCard from "@/components/store/ReviewCard";
import ReviewForm from "@/components/store/ReviewForm";
import StoreCard from "@/components/common/StoreCard";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import StarRating from "@/components/common/StarRating";
import { APP_NAME } from "@/lib/constants";
import { APP_URL } from "@/lib/constants";
import { isFollowingStore } from "@/services/wishlist.service";
import { canReviewStore } from "@/services/review.service";
import StoreReviewButton from "@/components/store/StoreReviewButton";

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

async function getStore(slug: string) {
  const store = await db.store.findFirst({
    where: { slug, status: "ACTIVE", deletedAt: null },
    include: {
      category: { select: { nameAr: true, emoji: true, slug: true } },
      subscription: { select: { plan: true, status: true } },
      productCategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, nameAr: true, emoji: true },
      },
      products: {
        where: { status: "ACTIVE", deletedAt: null },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 50,
        select: {
          id: true, name: true, priceInCents: true, comparePriceInCents: true,
          images: { take: 1, orderBy: { order: "asc" }, select: { url: true, alt: true } },
          store: { select: { id: true, name: true, slug: true, whatsappNumber: true, countryCode: true } },
        },
      },
      reviews: {
        where: { isApproved: true, reviewType: "STORE" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { products: true, reviews: true, followers: true } },
    },
  });

  if (!store) return null;

  // Increment visit counter atomically
  await db.store.update({ where: { id: store.id }, data: { totalVisits: { increment: 1 } } }).catch(() => {});

  return store;
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const base = process.env.NEXT_PUBLIC_APP_URL || APP_URL;
  const store = await db.store.findFirst({
    where: { slug, status: "ACTIVE", deletedAt: null },
    select: {
      name: true, description: true, seoTitle: true, seoDescription: true,
      logo: true, city: true, country: true, averageRating: true,
      category: { select: { nameAr: true } },
    },
  });
  if (!store) return { title: "متجر غير موجود" };

  const title       = store.seoTitle       || `${store.name} | ${APP_NAME}`;
  const description = store.seoDescription || store.description
    || `تسوق من متجر ${store.name} عبر واتساب${store.city ? ` في ${store.city}` : ""}. ${store.category?.nameAr || ""}`;
  const canonicalUrl = `${base}/store/${slug}`;
  const images       = store.logo ? [{ url: store.logo, alt: store.name }] : [{ url: "/og-image.png", alt: APP_NAME }];

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type:        "website",
      locale:      "ar_EG",
      url:         canonicalUrl,
      siteName:    APP_NAME,
      title,
      description,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: [images[0].url] },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const [store, session] = await Promise.all([getStore(slug), auth()]);
  if (!store) notFound();

  const [isFollowing, reviewCheck] = await Promise.all([
    session?.user?.id
      ? isFollowingStore(session.user.id, store.id)
      : Promise.resolve(false),
    session?.user?.id
      ? canReviewStore(session.user.id, store.id)
      : Promise.resolve({ can: false, reason: undefined }),
  ]);

  // Get related stores (same category)
  const relatedStores = store.categoryId ? await db.store.findMany({
    where: { status: "ACTIVE", categoryId: store.categoryId, id: { not: store.id }, deletedAt: null },
    take: 4,
    select: {
      id: true, name: true, slug: true, logo: true, cover: true, description: true,
      primaryColor: true, isVerified: true, isFeatured: true, whatsappNumber: true,
      countryCode: true, city: true, country: true, averageRating: true,
      category: { select: { nameAr: true, emoji: true } },
      _count: { select: { products: true, followers: true } },
    },
  }) : [];

  // Compute rating distribution
  const ratingGroups = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: store.reviews.filter((rev) => rev.rating === r).length,
  }));
  const totalReviews = store.reviews.length;

  const coverStyle = store.cover
    ? { backgroundImage: `url(${store.cover})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${store.primaryColor || "#4F6BFF"}, ${store.primaryColor || "#4F6BFF"}99)` };

  // ── Structured data ────────────────────────────────────────
  const base = process.env.NEXT_PUBLIC_APP_URL || APP_URL;
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    description: store.description || undefined,
    url: `${base}/store/${slug}`,
    image: store.logo || undefined,
    telephone: `+${store.countryCode || "20"}${store.whatsappNumber}`,
    address: store.city ? {
      "@type": "PostalAddress",
      addressLocality: store.city,
      addressCountry:  store.country || "EG",
    } : undefined,
    aggregateRating: store.averageRating > 0 ? {
      "@type":       "AggregateRating",
      ratingValue:   store.averageRating.toFixed(1),
      reviewCount:   store._count.reviews,
      bestRating:    "5",
      worstRating:   "1",
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <Navbar session={session} />

      {/* Cover */}
      <div className="relative h-[240px] md:h-[300px] overflow-hidden" style={coverStyle}>
        <div className="absolute inset-0 bg-black/30" />
        {!store.cover && (
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">
            {store.category?.emoji || "🏪"}
          </div>
        )}
        {/* Breadcrumb overlay */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 pt-5">
          <Breadcrumb items={[
            { label: "الرئيسية", href: "/" },
            { label: "المتاجر", href: "/stores" },
            { label: store.name },
          ]} />
        </div>
        {/* Cover actions */}
        <div className="absolute bottom-4 left-6 flex gap-2">
          <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 rounded-[10px] text-[12px] font-bold backdrop-blur-sm transition-all">
            ↗ مشاركة
          </button>
        </div>
      </div>

      {/* Profile bar (sticky) */}
      <StoreProfileBar
        store={{ ...store, createdAt: store.createdAt.toISOString() }}
        category={store.category}
        initialFollowing={isFollowing}
      />

      {/* Main content */}
      <div className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-7 items-start">

        {/* LEFT: Main content */}
        <div>
          {/* Products */}
          <StoreProductsGrid
            products={store.products}
            categories={store.productCategories}
            storeSlug={slug}
          />

          {/* About */}
          <div id="about" className="mb-10 bg-white rounded-[24px] border border-gray-100 p-6">
            <h3 className="text-[18px] font-black text-secondary mb-4">📋 عن المتجر</h3>
            <p className="text-[14px] text-gray-600 leading-[1.9]">
              {store.description || "لا يوجد وصف متاح لهذا المتجر حالياً."}
            </p>
          </div>

          {/* Reviews */}
          <div id="reviews" className="bg-white rounded-[24px] border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-black text-secondary">التقييمات والمراجعات</h3>
              <StoreReviewButton
                storeId={store.id}
                canReview={reviewCheck.can}
                reason={reviewCheck.reason}
                requiresAuth={!session?.user?.id}
              />
            </div>

            {/* Rating summary */}
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 mb-7 pb-7 border-b border-gray-100">
              <div className="text-center">
                <div className="text-[56px] font-black text-secondary leading-none mb-1">
                  {store.averageRating.toFixed(1)}
                </div>
                <StarRating value={Math.round(store.averageRating)} readonly size="lg" />
                <div className="text-[13px] text-gray-400 mt-1.5">من {store._count.reviews} تقييم</div>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                {ratingGroups.map(({ star, count }) => {
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-[12px] text-gray-500 w-12 text-left">{star} نجوم</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-gray-400 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review list */}
            {store.reviews.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-[14px]">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
            ) : (
              store.reviews.map((r) => <ReviewCard key={r.id} review={r} />)
            )}
          </div>
        </div>

        {/* RIGHT: Info sidebar */}
        <StoreInfoSidebar
          store={{
            ...store,
            businessHours: store.businessHours as Record<string, { isOpen: boolean; openTime: string; closeTime: string }> | null,
            createdAt: store.createdAt.toISOString(),
            _count: { products: store._count.products, reviews: store._count.reviews, followers: store._count.followers },
          }}
          category={store.category}
        />
      </div>

      {/* Related stores */}
      {relatedStores.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-6 pb-12">
          <h3 className="text-[20px] font-black text-secondary mb-5">متاجر مشابهة قد تعجبك</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedStores.map((s) => <StoreCard key={s.id} store={s} variant="grid" />)}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
