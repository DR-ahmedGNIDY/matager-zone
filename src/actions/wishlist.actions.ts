"use server";

import { auth } from "@/lib/auth";
import {
  toggleWishlistItem,
  isProductWishlisted,
  getWishlist,
  getWishlistCount,
  toggleFollowStore,
  isFollowingStore,
  getFollowedStores,
} from "@/services/wishlist.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Auth helper ───────────────────────────────────────────────
async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// ── Wishlist actions ──────────────────────────────────────────

export async function toggleWishlistAction(
  productId: string
): Promise<{ success: boolean; added?: boolean; error?: string; requiresAuth?: boolean }> {
  if (!z.string().min(1).safeParse(productId).success) {
    return { success: false, error: "معرف المنتج غير صحيح" };
  }

  const userId = await requireUserId();
  if (!userId) {
    return { success: false, requiresAuth: true, error: "يجب تسجيل الدخول لإضافة المنتجات للمفضلة" };
  }

  const result = await toggleWishlistItem(userId, productId);
  if (!result.success) return { success: false, error: result.error };

  revalidatePath("/dashboard/customer");
  revalidatePath(`/product/${productId}`);

  return { success: true, added: result.added };
}

export async function getWishlistAction(): Promise<{
  success: boolean;
  items?: Awaited<ReturnType<typeof getWishlist>>;
  count?: number;
  error?: string;
}> {
  const userId = await requireUserId();
  if (!userId) return { success: false, items: [], count: 0 };

  const [items, count] = await Promise.all([
    getWishlist(userId),
    getWishlistCount(userId),
  ]);
  return { success: true, items, count };
}

export async function isProductWishlistedAction(
  productId: string
): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;
  return isProductWishlisted(userId, productId);
}

export async function getWishlistCountAction(): Promise<number> {
  const userId = await requireUserId();
  if (!userId) return 0;
  return getWishlistCount(userId);
}

// ── Follow / Unfollow actions ─────────────────────────────────

export async function toggleFollowStoreAction(
  storeId: string
): Promise<{ success: boolean; following?: boolean; error?: string; requiresAuth?: boolean }> {
  if (!z.string().min(1).safeParse(storeId).success) {
    return { success: false, error: "معرف المتجر غير صحيح" };
  }

  const userId = await requireUserId();
  if (!userId) {
    return { success: false, requiresAuth: true, error: "يجب تسجيل الدخول لمتابعة المتاجر" };
  }

  const result = await toggleFollowStore(userId, storeId);
  if (!result.success) return { success: false, error: result.error };

  revalidatePath("/dashboard/customer");
  revalidatePath(`/store/${storeId}`);

  return { success: true, following: result.following };
}

export async function isFollowingStoreAction(
  storeId: string
): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;
  return isFollowingStore(userId, storeId);
}

export async function getFollowedStoresAction(): Promise<{
  success: boolean;
  stores?: Awaited<ReturnType<typeof getFollowedStores>>;
  error?: string;
}> {
  const userId = await requireUserId();
  if (!userId) return { success: false, stores: [] };

  const rows = await getFollowedStores(userId);
  // Filter out soft-deleted or inactive stores
  const activeRows = rows.filter(
    (r) => r.store.status === "ACTIVE" && !r.store.deletedAt
  );
  return { success: true, stores: activeRows };
}
