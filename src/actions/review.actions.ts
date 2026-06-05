"use server";

import { auth } from "@/lib/auth";
import {
  submitStoreReview,
  submitProductReview,
  canReviewStore,
  canReviewProduct,
  getCustomerReviews,
} from "@/services/review.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reviewInputSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().min(10, "التعليق 10 أحرف على الأقل").max(1000).optional(),
});

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// ── Store review ──────────────────────────────────────────────

export async function submitStoreReviewAction(
  storeId: string,
  input: unknown
): Promise<{ success: boolean; error?: string; requiresAuth?: boolean }> {
  const userId = await getUserId();
  if (!userId) return { success: false, requiresAuth: true, error: "يجب تسجيل الدخول لإضافة تقييم" };

  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const result = await submitStoreReview(
    userId, storeId, parsed.data.rating, parsed.data.comment
  );
  if (!result.success) return { success: false, error: result.error };

  revalidatePath(`/store/${storeId}`);
  revalidatePath("/dashboard/customer");
  return { success: true };
}

export async function canReviewStoreAction(
  storeId: string
): Promise<{ can: boolean; reason?: string; requiresAuth?: boolean }> {
  const userId = await getUserId();
  if (!userId) return { can: false, requiresAuth: true };
  const result = await canReviewStore(userId, storeId);
  return { can: result.can, reason: result.reason };
}

// ── Product review ────────────────────────────────────────────

export async function submitProductReviewAction(
  productId: string,
  input: unknown
): Promise<{ success: boolean; error?: string; requiresAuth?: boolean }> {
  const userId = await getUserId();
  if (!userId) return { success: false, requiresAuth: true, error: "يجب تسجيل الدخول لإضافة تقييم" };

  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const result = await submitProductReview(
    userId, productId, parsed.data.rating, parsed.data.comment
  );
  if (!result.success) return { success: false, error: result.error };

  revalidatePath(`/product/${productId}`);
  revalidatePath("/dashboard/customer");
  return { success: true };
}

export async function canReviewProductAction(
  productId: string
): Promise<{ can: boolean; reason?: string; requiresAuth?: boolean }> {
  const userId = await getUserId();
  if (!userId) return { can: false, requiresAuth: true };
  const result = await canReviewProduct(userId, productId);
  return { can: result.can, reason: result.reason };
}

// ── Customer reviews list ─────────────────────────────────────

export async function getCustomerReviewsAction() {
  const userId = await getUserId();
  if (!userId) return { success: false, reviews: [] };
  const reviews = await getCustomerReviews(userId);
  return { success: true, reviews };
}
