import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { APP_URL } from "@/lib/constants";

// Revalidate sitemap every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || APP_URL;
  const now  = new Date();

  // ── Static pages ──────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:              base,
      lastModified:     now,
      changeFrequency:  "daily",
      priority:         1.0,
    },
    {
      url:              `${base}/stores`,
      lastModified:     now,
      changeFrequency:  "hourly",
      priority:         0.9,
    },
  ];

  if (!process.env.DATABASE_URL) {
    return staticPages;
  }

  // ── Active stores ─────────────────────────────────────────
  const stores = await db.store.findMany({
    where:   { status: "ACTIVE", deletedAt: null },
    select:  { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take:    5000, // hard cap
  });

  const storePages: MetadataRoute.Sitemap = stores.map((s) => ({
    url:             `${base}/store/${s.slug}`,
    lastModified:    s.updatedAt,
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  // ── Active products ───────────────────────────────────────
  const products = await db.product.findMany({
    where:   { status: "ACTIVE", deletedAt: null, store: { status: "ACTIVE" } },
    select:  { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take:    50000, // hard cap
  });

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url:             `${base}/product/${p.id}`,
    lastModified:    p.updatedAt,
    changeFrequency: "weekly" as const,
    priority:        0.7,
  }));

  return [...staticPages, ...storePages, ...productPages];
}
