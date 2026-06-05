"use server";

import { auth } from "@/lib/auth";
import { updateCustomerProfile, getCustomerProfile } from "@/services/customer.service";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/notification.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// ── Profile ───────────────────────────────────────────────────

export async function updateProfileAction(
  input: unknown
): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "غير مصرح" };

  const result = await updateCustomerProfile(userId, input);
  if (!result.success) return result;

  revalidatePath("/dashboard/customer");
  return { success: true };
}

export async function getProfileAction() {
  const userId = await getUserId();
  if (!userId) return { success: false, profile: null };
  const profile = await getCustomerProfile(userId);
  return { success: true, profile };
}

// ── Notifications ─────────────────────────────────────────────

export async function markNotificationReadAction(
  notificationId: string
): Promise<{ success: boolean }> {
  if (!z.string().min(1).safeParse(notificationId).success) {
    return { success: false };
  }
  const userId = await getUserId();
  if (!userId) return { success: false };

  await markNotificationRead(userId, notificationId);
  revalidatePath("/dashboard/customer");
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean; count: number }> {
  const userId = await getUserId();
  if (!userId) return { success: false, count: 0 };

  const count = await markAllNotificationsRead(userId);
  revalidatePath("/dashboard/customer");
  return { success: true, count };
}
