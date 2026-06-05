import { db } from "@/lib/db";
import { normalizeWhatsAppNumber, generateUniqueSlug } from "@/lib/utils";
import { cloudinary } from "@/lib/cloudinary";

// ── Store settings update ─────────────────────────────────────

export interface StoreSettingsData {
  name?: string;
  description?: string;
  whatsappNumber?: string;
  countryCode?: string;
  welcomeMessage?: string;
  orderButtonText?: string;
  city?: string;
  country?: string;
  address?: string;
  primaryColor?: string;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  websiteUrl?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  // Logo/cover handled separately via uploadStoreLogo / uploadStoreCover
}

export async function updateStoreSettings(
  storeId: string,
  ownerId: string,
  data: StoreSettingsData
): Promise<{ success: boolean; error?: string }> {
  // Verify ownership
  const store = await db.store.findFirst({
    where: { id: storeId, ownerId, deletedAt: null },
    select: { id: true, slug: true, name: true },
  });
  if (!store) return { success: false, error: "المتجر غير موجود" };

  // Normalize WhatsApp number if provided
  let whatsappNumber = data.whatsappNumber;
  if (whatsappNumber && data.countryCode) {
    whatsappNumber = normalizeWhatsAppNumber(whatsappNumber, data.countryCode);
  }

  await db.store.update({
    where: { id: storeId },
    data: {
      ...(data.name             ? { name: data.name.trim() }             : {}),
      ...(data.description      !== undefined ? { description: data.description?.trim() || null } : {}),
      ...(whatsappNumber        ? { whatsappNumber }                     : {}),
      ...(data.countryCode      ? { countryCode: data.countryCode }      : {}),
      ...(data.welcomeMessage   !== undefined ? { welcomeMessage: data.welcomeMessage?.trim() || null } : {}),
      ...(data.orderButtonText  ? { orderButtonText: data.orderButtonText.trim() } : {}),
      ...(data.city             !== undefined ? { city: data.city?.trim() || null } : {}),
      ...(data.country          !== undefined ? { country: data.country || null }  : {}),
      ...(data.address          !== undefined ? { address: data.address?.trim() || null } : {}),
      ...(data.primaryColor     ? { primaryColor: data.primaryColor }   : {}),
      ...(data.instagramUrl     !== undefined ? { instagramUrl: data.instagramUrl || null } : {}),
      ...(data.tiktokUrl        !== undefined ? { tiktokUrl: data.tiktokUrl || null } : {}),
      ...(data.facebookUrl      !== undefined ? { facebookUrl: data.facebookUrl || null } : {}),
      ...(data.twitterUrl       !== undefined ? { twitterUrl: data.twitterUrl || null } : {}),
      ...(data.websiteUrl       !== undefined ? { websiteUrl: data.websiteUrl || null } : {}),
      ...(data.seoTitle         !== undefined ? { seoTitle: data.seoTitle?.trim() || null } : {}),
      ...(data.seoDescription   !== undefined ? { seoDescription: data.seoDescription?.trim() || null } : {}),
      ...(data.seoKeywords      !== undefined ? { seoKeywords: data.seoKeywords?.trim() || null } : {}),
    },
  });

  return { success: true };
}

export async function updateStoreLogo(
  storeId: string,
  ownerId: string,
  logoUrl: string,
  logoPublicId: string
): Promise<{ success: boolean; error?: string }> {
  const store = await db.store.findFirst({
    where: { id: storeId, ownerId, deletedAt: null },
    select: { logoPublicId: true },
  });
  if (!store) return { success: false, error: "المتجر غير موجود" };

  // Delete old logo from Cloudinary
  if (store.logoPublicId) {
    await cloudinary.uploader.destroy(store.logoPublicId).catch(() => {});
  }

  await db.store.update({
    where: { id: storeId },
    data: { logo: logoUrl, logoPublicId },
  });
  return { success: true };
}

export async function updateStoreCover(
  storeId: string,
  ownerId: string,
  coverUrl: string,
  coverPublicId: string
): Promise<{ success: boolean; error?: string }> {
  const store = await db.store.findFirst({
    where: { id: storeId, ownerId, deletedAt: null },
    select: { coverPublicId: true },
  });
  if (!store) return { success: false, error: "المتجر غير موجود" };

  if (store.coverPublicId) {
    await cloudinary.uploader.destroy(store.coverPublicId).catch(() => {});
  }

  await db.store.update({
    where: { id: storeId },
    data: { cover: coverUrl, coverPublicId },
  });
  return { success: true };
}

// ── Get owner's store ─────────────────────────────────────────

export async function getOwnerStore(ownerId: string) {
  return db.store.findFirst({
    where: { ownerId, deletedAt: null },
    include: {
      category: { select: { id: true, nameAr: true, emoji: true, slug: true } },
      _count: { select: { products: true, orders: true, followers: true, reviews: true } },
    },
  });
}
