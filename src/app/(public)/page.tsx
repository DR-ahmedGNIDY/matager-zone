import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedStoresSection from "@/components/home/FeaturedStoresSection";
import LatestProductsSection from "@/components/home/LatestProductsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhatsAppPromoSection from "@/components/home/WhatsAppPromoSection";
import PricingSection from "@/components/home/PricingSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import FaqSection from "@/components/home/FaqSection";
import CtaSection from "@/components/home/CtaSection";
import { APP_NAME, APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} | منصة إنشاء وإدارة المتاجر الرقمية`,
  description: "أنشئ متجرك الإلكتروني في دقائق وابدأ البيع لآلاف العملاء. الطلبات تصل مباشرة عبر واتساب. 500+ متجر نشط.",
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL || APP_URL },
  openGraph: {
    type:        "website",
    locale:      "ar_EG",
    title:       `${APP_NAME} | منصة المتاجر الرقمية عبر واتساب`,
    description: "أنشئ متجرك وابدأ البيع عبر واتساب — بدون دفع إلكتروني أو تعقيدات.",
    url:         process.env.NEXT_PUBLIC_APP_URL || APP_URL,
    siteName:    APP_NAME,
    images:      [{ url: "/og-image.png", width: 1200, height: 630, alt: APP_NAME }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       `${APP_NAME} | منصة المتاجر الرقمية`,
    description: "أنشئ متجرك وابدأ البيع عبر واتساب.",
    images:      ["/og-image.png"],
  },
};

// Revalidate homepage every 60 seconds
export const revalidate = 60;

async function getHomepageData() {
  const [categories, featuredStores, latestProducts, stats] = await Promise.all([
    // Store categories
    db.storeCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, nameAr: true, emoji: true, slug: true, _count: { select: { stores: true } } },
    }),

    // Featured stores
    db.store.findMany({
      where: { status: "ACTIVE", isFeatured: true, deletedAt: null },
      take: 6,
      orderBy: { totalOrders: "desc" },
      select: {
        id: true, name: true, slug: true, logo: true, cover: true,
        description: true, primaryColor: true, isVerified: true, isFeatured: true,
        whatsappNumber: true, countryCode: true, city: true, country: true,
        averageRating: true,
        category: { select: { nameAr: true, emoji: true } },
        _count: { select: { products: true, followers: true } },
      },
    }),

    // Latest products
    db.product.findMany({
      where: { status: "ACTIVE", deletedAt: null, store: { status: "ACTIVE" } },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, priceInCents: true, comparePriceInCents: true,
        images: { take: 1, orderBy: { order: "asc" }, select: { url: true, alt: true } },
        store: { select: { id: true, name: true, slug: true, whatsappNumber: true, countryCode: true } },
      },
    }),

    // Platform stats
    Promise.all([
      db.store.count({ where: { status: "ACTIVE", deletedAt: null } }),
      db.product.count({ where: { status: "ACTIVE", deletedAt: null } }),
      db.user.count({ where: { deletedAt: null, isActive: true } }),
    ]),
  ]);

  return {
    categories,
    featuredStores,
    latestProducts,
    stats: { stores: stats[0], products: stats[1], users: stats[2] },
  };
}

export default async function HomePage() {
  const [data, session] = await Promise.all([
    getHomepageData(),
    auth(),
  ]);

  return (
    <>
      <Navbar session={session} />
      <main>
        <HeroSection />
        <StatsBar
          stores={data.stats.stores}
          products={data.stats.products}
          users={data.stats.users}
        />
        <CategoriesSection categories={data.categories} />
        <FeaturedStoresSection stores={data.featuredStores} />
        <LatestProductsSection products={data.latestProducts} />
        <HowItWorksSection />
        <WhatsAppPromoSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
