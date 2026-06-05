import { db } from "@/lib/db";
import { createNotification } from "@/services/notification.service";
import { ADMIN_WHATSAPP_NUMBER } from "@/lib/constants";
import type { StoreStatus } from "@/types";

// ── MongoDB-compatible rating recalculation ───────────────────
async function recalculateStoreRating(prisma: typeof db, storeId: string) {
  const reviews = await prisma.review.findMany({
    where: { storeId, isApproved: true, reviewType: "STORE" },
    select: { rating: true },
  });
  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  await prisma.store.update({
    where: { id: storeId },
    data:  { averageRating: avg },
  });
}


// ── Store management ──────────────────────────────────────────

export async function approveStore(
  storeId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const store = await db.store.findFirst({
    where: { id: storeId, status: "PENDING", deletedAt: null },
    select: { id: true, name: true, ownerId: true },
  });
  if (!store) return { success: false, error: "المتجر غير موجود أو ليس في انتظار المراجعة" };

  await db.$transaction(async (tx) => {
    await tx.store.update({
      where: { id: storeId },
      data: {
        status:     "ACTIVE",
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    await tx.auditLog.create({
      data: {
        action:   "STORE_APPROVED",
        entity:   "Store",
        entityId: storeId,
        userId:   adminId,
        metadata: { storeName: store.name },
      },
    });
  });

  // Notify store owner
  await createNotification({
    userId:  store.ownerId,
    title:   "تم قبول متجرك! 🎉",
    message: `تهانينا! تم قبول متجر "${store.name}" وهو الآن نشط على المنصة.`,
    type:    "STORE",
    link:    "/dashboard/store-owner",
  }).catch(() => {});

  return { success: true };
}

export async function rejectStore(
  storeId: string,
  adminId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!reason?.trim()) return { success: false, error: "سبب الرفض مطلوب" };

  const store = await db.store.findFirst({
    where: { id: storeId, status: "PENDING", deletedAt: null },
    select: { id: true, name: true, ownerId: true },
  });
  if (!store) return { success: false, error: "المتجر غير موجود أو ليس في انتظار المراجعة" };

  await db.$transaction(async (tx) => {
    await tx.store.update({
      where: { id: storeId },
      data:  { status: "REJECTED", rejectionReason: reason.trim() },
    });

    await tx.auditLog.create({
      data: {
        action:   "STORE_REJECTED",
        entity:   "Store",
        entityId: storeId,
        userId:   adminId,
        metadata: { storeName: store.name, reason },
      },
    });
  });

  await createNotification({
    userId:  store.ownerId,
    title:   "تحديث حول طلب متجرك",
    message: `بخصوص متجر "${store.name}": ${reason}. يمكنك التواصل معنا عبر واتساب للاستفسار.`,
    type:    "STORE",
    link:    "/dashboard/store-owner",
  }).catch(() => {});

  return { success: true };
}

export async function suspendStore(
  storeId: string,
  adminId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const store = await db.store.findFirst({
    where: { id: storeId, status: "ACTIVE", deletedAt: null },
    select: { id: true, name: true, ownerId: true },
  });
  if (!store) return { success: false, error: "المتجر غير موجود أو ليس نشطاً" };

  await db.$transaction(async (tx) => {
    await tx.store.update({
      where: { id: storeId },
      data:  { status: "SUSPENDED", suspendReason: reason?.trim() || null },
    });

    await tx.auditLog.create({
      data: {
        action:   "STORE_SUSPENDED",
        entity:   "Store",
        entityId: storeId,
        userId:   adminId,
        metadata: { storeName: store.name, reason },
      },
    });
  });

  await createNotification({
    userId:  store.ownerId,
    title:   "تم إيقاف متجرك مؤقتاً",
    message: `تم إيقاف متجر "${store.name}" مؤقتاً. تواصل معنا عبر واتساب للاستفسار.`,
    type:    "STORE",
    link:    "/dashboard/store-owner",
  }).catch(() => {});

  return { success: true };
}

export async function reactivateStore(
  storeId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const store = await db.store.findFirst({
    where: { id: storeId, status: "SUSPENDED", deletedAt: null },
    select: { id: true, name: true, ownerId: true },
  });
  if (!store) return { success: false, error: "المتجر غير موجود أو ليس موقوفاً" };

  await db.$transaction(async (tx) => {
    await tx.store.update({
      where: { id: storeId },
      data:  { status: "ACTIVE", suspendReason: null },
    });

    await tx.auditLog.create({
      data: {
        action:   "STORE_REACTIVATED",
        entity:   "Store",
        entityId: storeId,
        userId:   adminId,
        metadata: { storeName: store.name },
      },
    });
  });

  await createNotification({
    userId:  store.ownerId,
    title:   "تم إعادة تفعيل متجرك ✅",
    message: `تم إعادة تفعيل متجر "${store.name}". يمكنك الآن متابعة البيع.`,
    type:    "STORE",
    link:    "/dashboard/store-owner",
  }).catch(() => {});

  return { success: true };
}

// WhatsApp message builder for store approval flow
export function buildStoreApprovalWaMessage(storeName: string, ownerName: string): string {
  return `السلام عليكم ${ownerName || ""}،\nبخصوص طلب متجر "${storeName}" على منصة متاجر زون،\nيرجى إكمال إجراءات القبول للبدء في الإعلان.\nشكراً لكم 🙏`;
}

export function buildStoreAdminWaUrl(
  ownerWhatsapp: string,
  storeName: string,
  ownerName: string
): string {
  const msg = encodeURIComponent(buildStoreApprovalWaMessage(storeName, ownerName));
  return `https://wa.me/${ownerWhatsapp}?text=${msg}`;
}

// ── User management ───────────────────────────────────────────

export async function toggleUserActive(
  targetUserId: string,
  adminId: string
): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  if (targetUserId === adminId) {
    return { success: false, error: "لا يمكنك تعطيل حسابك الخاص" };
  }

  const user = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, isActive: true, role: true },
  });
  if (!user) return { success: false, error: "المستخدم غير موجود" };
  if (user.role === "ADMIN") return { success: false, error: "لا يمكن تعطيل حساب مدير آخر" };

  const newState = !user.isActive;
  await db.user.update({ where: { id: targetUserId }, data: { isActive: newState } });

  await db.auditLog.create({
    data: {
      action:   newState ? "USER_ACTIVATED" : "USER_SUSPENDED",
      entity:   "User",
      entityId: targetUserId,
      userId:   adminId,
    },
  });

  return { success: true, isActive: newState };
}

// ── Category management ───────────────────────────────────────

export async function listCategories() {
  return db.storeCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { stores: true } } },
  });
}

export async function createCategory(data: {
  name: string; nameAr: string; emoji: string; slug: string; description?: string;
}, adminId: string) {
  const cat = await db.storeCategory.create({
    data: {
      name:        data.name.trim(),
      nameAr:      data.nameAr.trim(),
      emoji:       data.emoji.trim(),
      slug:        data.slug.toLowerCase().trim(),
      description: data.description?.trim() || null,
    },
  });

  await db.auditLog.create({
    data: { action: "CATEGORY_CREATED", entity: "StoreCategory", entityId: cat.id, userId: adminId },
  });

  return cat;
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; nameAr: string; emoji: string; isActive: boolean; sortOrder: number }>,
  adminId: string
) {
  const cat = await db.storeCategory.update({ where: { id }, data });
  await db.auditLog.create({
    data: { action: "CATEGORY_UPDATED", entity: "StoreCategory", entityId: id, userId: adminId },
  });
  return cat;
}

// ── Review management ─────────────────────────────────────────

export async function listPendingReviews() {
  return db.review.findMany({
    where: { isApproved: false, isReported: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user:    { select: { id: true, name: true, email: true } },
      store:   { select: { id: true, name: true, slug: true } },
      product: { select: { id: true, name: true } },
    },
  });
}

export async function approveReview(reviewId: string, adminId: string) {
  const review = await db.review.update({
    where: { id: reviewId },
    data:  { isApproved: true },
    select: { storeId: true },
  });
  // Trigger re-calculation of store average rating via update (triggers DB function)
  if (review.storeId) {
    if (review.storeId) { await recalculateStoreRating(db, review.storeId); }
  }
  await db.auditLog.create({
    data: { action: "REVIEW_APPROVED", entity: "Review", entityId: reviewId, userId: adminId },
  });
}

export async function deleteReview(reviewId: string, adminId: string) {
  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { storeId: true },
  });
  await db.review.delete({ where: { id: reviewId } });
  if (review?.storeId) {
    if (review.storeId) { await recalculateStoreRating(db, review.storeId); }
  }
  await db.auditLog.create({
    data: { action: "REVIEW_DELETED", entity: "Review", entityId: reviewId, userId: adminId },
  });
}

// ── Platform settings ─────────────────────────────────────────

export async function getPlatformSettings() {
  return db.platformSettings.findFirst();
}

export async function updatePlatformSettings(
  data: {
    siteName?: string; siteDescription?: string;
    supportEmail?: string; supportWhatsapp?: string;
    maintenanceMode?: boolean; allowRegistration?: boolean;
    requireEmailVerification?: boolean; autoApproveStores?: boolean;
  },
  adminId: string
) {
  const existing = await db.platformSettings.findFirst();

  if (existing) {
    await db.platformSettings.update({ where: { id: existing.id }, data });
  } else {
    await db.platformSettings.create({ data });
  }

  await db.auditLog.create({
    data: { action: "SETTINGS_UPDATED", entity: "PlatformSettings", userId: adminId, metadata: data as object },
  });
}

// ── Audit log ─────────────────────────────────────────────────

export async function getRecentAuditLogs(limit = 50) {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { name: true, email: true } },
    },
  });
}

// ── Dashboard stats ───────────────────────────────────────────

export async function getAdminStats() {
  const [
    totalUsers, totalStores, activeStores, pendingStores,
    totalProducts, newStoresThisWeek,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.store.count({ where: { deletedAt: null } }),
    db.store.count({ where: { status: "ACTIVE", deletedAt: null } }),
    db.store.count({ where: { status: "PENDING", deletedAt: null } }),
    db.product.count({ where: { status: "ACTIVE", deletedAt: null } }),
    db.store.count({
      where: {
        deletedAt: null,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    totalUsers, totalStores, activeStores,
    pendingStores, totalProducts, newStoresThisWeek,
  };
}
