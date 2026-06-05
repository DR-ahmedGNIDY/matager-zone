/**
 * WishlistService — wishlist and store-follow DB operations.
 *
 * Wishlist requires authentication (no guest wishlist).
 * The user's Wishlist row is created at registration; here we
 * upsert it defensively in case it doesn't exist.
 */

import { db } from "@/lib/db";

// ── Types ─────────────────────────────────────────────────────

export interface WishlistItemFull {
  id: string;
  productId: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    priceInCents: number;
    comparePriceInCents: number | null;
    status: string;
    images: { url: string; alt: string | null }[];
    store: {
      id: string;
      name: string;
      slug: string;
      whatsappNumber: string;
      countryCode: string;
    };
  };
}

// ── Wishlist helpers ──────────────────────────────────────────

async function getOrCreateWishlist(userId: string) {
  return db.wishlist.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });
}

// ── Wishlist public API ───────────────────────────────────────

export async function getWishlist(userId: string): Promise<WishlistItemFull[]> {
  const wishlist = await db.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              priceInCents: true,
              comparePriceInCents: true,
              status: true,
              images: {
                take: 1,
                orderBy: { order: "asc" },
                select: { url: true, alt: true },
              },
              store: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  whatsappNumber: true,
                  countryCode: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!wishlist) return [];
  // Filter out items where product is no longer active
  return wishlist.items.filter(
    (item) => item.product.status === "ACTIVE"
  ) as unknown as WishlistItemFull[];
}

/**
 * Toggle product in wishlist.
 * Returns the new state: true = added, false = removed.
 */
export async function toggleWishlistItem(
  userId: string,
  productId: string
): Promise<{ success: boolean; added: boolean; error?: string }> {
  // Verify product exists
  const product = await db.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true },
  });
  if (!product) return { success: false, added: false, error: "المنتج غير موجود" };

  const wishlist = await getOrCreateWishlist(userId);

  const existing = await db.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    select: { id: true },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    return { success: true, added: false };
  }

  await db.wishlistItem.create({
    data: { wishlistId: wishlist.id, productId },
  });
  return { success: true, added: true };
}

/**
 * Check if a specific product is in the user's wishlist.
 */
export async function isProductWishlisted(
  userId: string,
  productId: string
): Promise<boolean> {
  const wishlist = await db.wishlist.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!wishlist) return false;

  const item = await db.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    select: { id: true },
  });
  return !!item;
}

/**
 * Get wishlist product IDs (for bulk isWishlisted checks on listing pages).
 */
export async function getWishlistedProductIds(userId: string): Promise<Set<string>> {
  const wishlist = await db.wishlist.findUnique({
    where: { userId },
    select: {
      items: { select: { productId: true } },
    },
  });
  if (!wishlist) return new Set();
  return new Set(wishlist.items.map((i) => i.productId));
}

export async function getWishlistCount(userId: string): Promise<number> {
  const wishlist = await db.wishlist.findUnique({
    where: { userId },
    select: { _count: { select: { items: true } } },
  });
  return wishlist?._count.items ?? 0;
}

// ── Store Follow public API ───────────────────────────────────

/**
 * Toggle follow/unfollow a store.
 * Returns the new state: true = now following, false = unfollowed.
 */
export async function toggleFollowStore(
  userId: string,
  storeId: string
): Promise<{ success: boolean; following: boolean; error?: string }> {
  // Verify store exists and is active
  const store = await db.store.findFirst({
    where: { id: storeId, status: "ACTIVE", deletedAt: null },
    select: { id: true },
  });
  if (!store) return { success: false, following: false, error: "المتجر غير موجود" };

  const existing = await db.storeFollower.findUnique({
    where: { userId_storeId: { userId, storeId } },
    select: { id: true },
  });

  if (existing) {
    await db.storeFollower.delete({ where: { id: existing.id } });
    // Decrement denormalized counter atomically
    await db.store.update({ where: { id: storeId }, data: { totalFollowers: { decrement: 1 } } });
    return { success: true, following: false };
  }

  await db.storeFollower.create({ data: { userId, storeId } });
  // Increment denormalized counter atomically
  await db.store.update({ where: { id: storeId }, data: { totalFollowers: { increment: 1 } } });
  return { success: true, following: true };
}

/**
 * Check if user is following a store.
 */
export async function isFollowingStore(
  userId: string,
  storeId: string
): Promise<boolean> {
  const row = await db.storeFollower.findUnique({
    where: { userId_storeId: { userId, storeId } },
    select: { id: true },
  });
  return !!row;
}

/**
 * Get all store IDs followed by a user (for bulk checks).
 */
export async function getFollowedStoreIds(userId: string): Promise<Set<string>> {
  const rows = await db.storeFollower.findMany({
    where: { userId },
    select: { storeId: true },
  });
  return new Set(rows.map((r) => r.storeId));
}

export async function getFollowedStores(userId: string) {
  return db.storeFollower.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      store: {
        select: {
          id: true, name: true, slug: true, logo: true, cover: true,
          description: true, primaryColor: true, isVerified: true,
          isFeatured: true, whatsappNumber: true, countryCode: true,
          city: true, country: true, averageRating: true, status: true,
          deletedAt: true,
          category: { select: { nameAr: true, emoji: true } },
          _count: { select: { products: true, followers: true } },
        },
      },
    },
  });
}
