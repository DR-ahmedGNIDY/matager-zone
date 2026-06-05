import { db } from "@/lib/db";
import type { NotificationType } from "@/types";

// ── Read ──────────────────────────────────────────────────────

export async function getNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true, title: true, message: true,
      type: true, isRead: true, link: true, createdAt: true,
    },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, isRead: false } });
}

// ── Write ─────────────────────────────────────────────────────

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<boolean> {
  const result = await db.notification.updateMany({
    where: { id: notificationId, userId },
    data:  { isRead: true },
  });
  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await db.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });
  return result.count;
}

// ── Create (used by other services / Phase 6-7) ───────────────

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const notif = await db.notification.create({
    data: {
      userId:   params.userId,
      title:    params.title,
      message:  params.message,
      type:     params.type,
      link:     params.link ?? null,
      metadata: params.metadata ? (params.metadata as object) : undefined,
    },
    select: { id: true },
  });
  return notif.id;
}
