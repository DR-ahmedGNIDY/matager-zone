import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import ProductCard from "@/components/common/ProductCard";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { formatPrice } from "@/lib/utils";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { isProductWishlisted } from "@/services/wishlist.service";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  return db.product.findFirst({
    where: { id, status: "ACTIVE", deletedAt: null, store: { status: "ACTIVE" } },
    include: {
      store: {
        select: {
          id: true, name: true, slug: true, whatsappNumber: true, countryCode: true,
          logo: true, isVerified: true,
        },
      },
      category: { select: { id: true, name: true, nameAr: true, emoji: true } },
      images: { orderBy: { order: "asc" } },
      reviews: {
        where: { isApproved: true, reviewType: "PRODUCT" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { reviews: true } },
    },
  });
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_APP_URL || APP_URL;
  const product = await db.product.findFirst({
    where: { id, status: "ACTIVE", deletedAt: null },
    select: {
      name: true, description: true, seoTitle: true, seoDescription: true,
      priceInCents: true, tags: true,
      images: { take: 1, select: { url: true } },
      store: { select: { name: true, slug: true } },
    },
  });
  if (!product) return { title: "منتج غير موجود" };

  const title       = product.seoTitle       || `${product.name} | ${product.store.name} | ${APP_NAME}`;
  const description = product.seoDescription || product.description?.slice(0, 160)
    || `${product.name} من متجر ${product.store.name} — اطلب عبر واتساب بسهولة.`;
  const canonicalUrl = `${base}/product/${id}`;
  const image        = product.images[0]?.url || "/og-image.png";

  return {
    title,
    description,
    keywords: product.tags.length > 0 ? product.tags : undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type:        "website",
      locale:      "ar_EG",
      url:         canonicalUrl,
      siteName:    APP_NAME,
      title,
      description,
      images:      [{ url: image, alt: product.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [product, session] = await Promise.all([getProduct(id), auth()]);
  if (!product) notFound();

  const isWishlisted = session?.user?.id
    ? await isProductWishlisted(session.user.id, id)
    : false;

  // Compute average rating
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  // Related products from same store
  const related = await db.product.findMany({
    where: { storeId: product.storeId, status: "ACTIVE", deletedAt: null, id: { not: id } },
    take: 6,
    orderBy: { totalOrders: "desc" },
    select: {
      id: true, name: true, priceInCents: true, comparePriceInCents: true,
      images: { take: 1, orderBy: { order: "asc" }, select: { url: true, alt: true } },
      store: { select: { id: true, name: true, slug: true, whatsappNumber: true, countryCode: true } },
    },
  });

  const productForInfo = {
    ...product,
    variants: (product.variants as Array<{ name: string; options: string[] }>) || [],
    averageRating: avgRating > 0 ? avgRating : undefined,
    _count: { reviews: product._count.reviews },
  };

  // ── Structured data ────────────────────────────────────────
  const base = process.env.NEXT_PUBLIC_APP_URL || APP_URL;
  const productJsonLd = {
    "@context":  "https://schema.org",
    "@type":     "Product",
    name:        product.name,
    description: product.description || undefined,
    image:       product.images.map((i) => i.url),
    sku:         product.sku || undefined,
    url:         `${base}/product/${id}`,
    brand: {
      "@type": "Brand",
      name:    product.store.name,
    },
    offers: {
      "@type":         "Offer",
      priceCurrency:   "EGP",
      price:           (product.priceInCents / 100).toFixed(2),
      availability:    product.status === "ACTIVE"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url:             `${base}/product/${id}`,
      seller: {
        "@type": "Organization",
        name:    product.store.name,
      },
    },
    aggregateRating: avgRating > 0 ? {
      "@type":       "AggregateRating",
      ratingValue:   avgRating.toFixed(1),
      reviewCount:   product._count.reviews,
      bestRating:    "5",
      worstRating:   "1",
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Navbar session={session} />

      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <Breadcrumb items={[
          { label: "الرئيسية", href: "/" },
          { label: "المتاجر", href: "/stores" },
          { label: product.store.name, href: `/store/${product.store.slug}` },
          { label: product.name },
        ]} />

        {/* Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-8 mt-4 mb-10">
          <ProductGallery
            images={product.images}
            productName={product.name}
            priceInCents={product.priceInCents}
            comparePriceInCents={product.comparePriceInCents}
            productId={id}
            isWishlisted={isWishlisted}
          />
          <ProductInfo product={productForInfo} />
        </div>

        {/* Tabs */}
        <div className="mb-10">
          <ProductTabs
            description={product.description}
            sku={product.sku}
            tags={product.tags}
            reviews={product.reviews}
            averageRating={avgRating > 0 ? avgRating : undefined}
          />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-[22px] font-black text-secondary mb-5">منتجات قد تعجبك من نفس المتجر</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
