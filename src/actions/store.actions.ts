"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateStoreSettings, updateStoreLogo, updateStoreCover } from "@/services/store.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { OrderStatus } from "@/types";

async function getOwnedStoreId(userId: string): Promise<string | null> {
  const store = await db.store.findFirst({
    where: { ownerId: userId, deletedAt: null },
    select: { id: true },
  });
  return store?.id ?? null;
}

// ── Store settings ────────────────────────────────────────────

const storeSettingsSchema = z.object({
  name:            z.string().min(2).max(100).optional(),
  description:     z.string().max(500).optional(),
  whatsappNumber:  z.string().regex(/^[0-9]{7,15}$/).optional(),
  countryCode:     z.string().regex(/^[0-9]{1,4}$/).optional(),
  welcomeMessage:  z.string().max(500).optional(),
  orderButtonText: z.string().min(1).max(50).optional(),
  city:            z.string().max(100).optional(),
  country:         z.string().max(100).optional(),
  address:         z.string().max(300).optional(),
  primaryColor:    z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  instagramUrl:    z.string().url().optional().nullable().or(z.literal("")),
  tiktokUrl:       z.string().url().optional().nullable().or(z.literal("")),
  facebookUrl:     z.string().url().optional().nullable().or(z.literal("")),
  twitterUrl:      z.string().url().optional().nullable().or(z.literal("")),
  websiteUrl:      z.string().url().optional().nullable().or(z.literal("")),
  seoTitle:        z.string().max(60).optional(),
  seoDescription:  z.string().max(160).optional(),
  seoKeywords:     z.string().max(200).optional(),
});

export async function updateStoreSettingsAction(
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  const user = await auth();
  if (!user?.user?.id) return { success: false, error: "غير مصرح" };

  const parsed = storeSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const storeId = await getOwnedStoreId(user.user.id);
  if (!storeId) return { success: false, error: "لا يوجد متجر" };

  const result = await updateStoreSettings(storeId, user.user.id, {
    ...parsed.data,
    instagramUrl: parsed.data.instagramUrl || null,
    tiktokUrl:    parsed.data.tiktokUrl    || null,
    facebookUrl:  parsed.data.facebookUrl  || null,
    twitterUrl:   parsed.data.twitterUrl   || null,
    websiteUrl:   parsed.data.websiteUrl   || null,
  });

  if (!result.success) return result;

  revalidatePath("/dashboard/store-owner");
  revalidatePath("/dashboard/store-owner/settings");
  return { success: true };
}

export async function updateStoreLogoAction(
  logoUrl: string,
  logoPublicId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await auth();
  if (!user?.user?.id) return { success: false, error: "غير مصرح" };

  const storeId = await getOwnedStoreId(user.user.id);
  if (!storeId) return { success: false, error: "لا يوجد متجر" };

  const result = await updateStoreLogo(storeId, user.user.id, logoUrl, logoPublicId);
  if (!result.success) return result;

  revalidatePath("/dashboard/store-owner/settings");
  return { success: true };
}

export async function updateStoreCoverAction(
  coverUrl: string,
  coverPublicId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await auth();
  if (!user?.user?.id) return { success: false, error: "غير مصرح" };

  const storeId = await getOwnedStoreId(user.user.id);
  if (!storeId) return { success: false, error: "لا يوجد متجر" };

  const result = await updateStoreCover(storeId, user.user.id, coverUrl, coverPublicId);
  if (!result.success) return result;

  revalidatePath("/dashboard/store-owner/settings");
  return { success: true };
}

// ── Order management ──────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  NEW:       ["VIEWED", "CONTACTED", "CANCELLED"],
  VIEWED:    ["CONTACTED", "CANCELLED"],
  CONTACTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const user = await auth();
  if (!user?.user?.id) return { success: false, error: "غير مصرح" };

  const storeId = await getOwnedStoreId(user.user.id);
  if (!storeId) return { success: false, error: "لا يوجد متجر" };

  const order = await db.order.findFirst({
    where: { id: orderId, storeId },
    select: { id: true, status: true },
  });
  if (!order) return { success: false, error: "الطلب غير موجود" };

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return { success: false, error: `لا يمكن تغيير الحالة من ${order.status} إلى ${newStatus}` };
  }

  await db.order.update({
    where: { id: orderId },
    data:  { status: newStatus },
  });

  revalidatePath("/dashboard/store-owner/orders");
  revalidatePath("/dashboard/store-owner");
  return { success: true };
}
