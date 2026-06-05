/**
 * ReviewService — review submission and retrieval.
 *
 * Rules:
 * - One review per user per store (reviewType: STORE)
 * - One review per user per product (reviewType: PRODUCT)
 * - Reviews start as isApproved: false — admin approves
 *   (configurable: autoApprove from PlatformSettings)
 * - averageRating on Store is updated by DB trigger after insert/update
 */

import { db } from "@/lib/db";

export interface CanReviewResult {
  can: boolean;
  reason?: "NOT_PURCHASED" | "ALREADY_REVIEWED" | "STORE_INACTIVE";
  existingReviewId?: string;
}

// ── Helpers ───────────────────────────────────────────────────

async function getAutoApprove(): Promise<boolean> {
  const settings = await db.platformSettings.findFirst({
    select: { autoApproveStores: true },
  });
  // Reuse autoApproveStores flag for reviews too — simple for v1
  return settings?.autoApproveStores ?? false;
}

// ── Store Reviews ─────────────────────────────────────────────

/**
 * Check whether a user can review a store.
 * Requires at least one COMPLETED or CONFIRMED order from that store.
 */
export async function canReviewStore(
  userId: string,
  storeId: string
): Promise<CanReviewResult> {
  // Check store is active
  const store = await db.store.findFirst({
    where: { id: storeId, status: "ACTIVE", deletedAt: null },
    select: { id: true },
  });
  if (!store) return { can: false, reason: "STORE_INACTIVE" };

  // Check already reviewed
  const existing = await db.review.findFirst({
    where: { userId, storeId, reviewType: "STORE" },
    select: { id: true },
  });
  if (existing) return { can: false, reason: "ALREADY_REVIEWED", existingReviewId: existing.id };

  // Check has a completed/confirmed order
  const order = await db.order.findFirst({
    where: {
      customerId: userId,
      storeId,
      status: { in: ["COMPLETED", "CONFIRMED"] },
    },
    select: { id: true },
  });
  if (!order) return { can: false, reason: "NOT_PURCHASED" };

  return { can: true };
}

export async function submitStoreReview(
  userId: string,
  storeId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  const check = await canReviewStore(userId, storeId);
  if (!check.can) {
    const msgs: Record<string, string> = {
      ALREADY_REVIEWED: "لقد أضفت تقييماً لهذا المتجر من قبل",
      NOT_PURCHASED:    "يجب إتمام طلب من هذا المتجر قبل التقييم",
      STORE_INACTIVE:   "المتجر غير متاح",
    };
    return { success: false, error: msgs[check.reason!] ?? "لا يمكن التقييم" };
  }

  const autoApprove = await getAutoApprove();
  const review = await db.review.create({
    data: {
      reviewType: "STORE",
      userId,
      storeId,
      rating,
      comment: comment?.trim() || null,
      isApproved: autoApprove,
    },
    select: { id: true },
  });

  return { success: true, reviewId: review.id };
}

// ── Product Reviews ───────────────────────────────────────────

export async function canReviewProduct(
  userId: string,
  productId: string
): Promise<CanReviewResult> {
  // Check already reviewed
  const existing = await db.review.findFirst({
    where: { userId, productId, reviewType: "PRODUCT" },
    select: { id: true },
  });
  if (existing) return { can: false, reason: "ALREADY_REVIEWED", existingReviewId: existing.id };

  // Check product is in a completed/confirmed order
  const orderItem = await db.orderItem.findFirst({
    where: {
      productId,
      order: {
        customerId: userId,
        status: { in: ["COMPLETED", "CONFIRMED"] },
      },
    },
    select: { id: true },
  });
  if (!orderItem) return { can: false, reason: "NOT_PURCHASED" };

  return { can: true };
}

export async function submitProductReview(
  userId: string,
  productId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  const check = await canReviewProduct(userId, productId);
  if (!check.can) {
    const msgs: Record<string, string> = {
      ALREADY_REVIEWED: "لقد أضفت تقييماً لهذا المنتج من قبل",
      NOT_PURCHASED:    "يجب شراء المنتج قبل التقييم",
    };
    return { success: false, error: msgs[check.reason!] ?? "لا يمكن التقييم" };
  }

  const autoApprove = await getAutoApprove();
  const review = await db.review.create({
    data: {
      reviewType: "PRODUCT",
      userId,
      productId,
      rating,
      comment: comment?.trim() || null,
      isApproved: autoApprove,
    },
    select: { id: true },
  });

  return { success: true, reviewId: review.id };
}

// ── Customer reviews list ─────────────────────────────────────

export async function getCustomerReviews(userId: string) {
  return db.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reviewType: true,
      rating: true,
      comment: true,
      isApproved: true,
      createdAt: true,
      store:   { select: { id: true, name: true, slug: true } },
      product: { select: { id: true, name: true } },
    },
  });
}
