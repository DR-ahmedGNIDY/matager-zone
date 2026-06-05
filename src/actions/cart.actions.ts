"use server";

import { auth } from "@/lib/auth";
import { getOrCreateCartSessionId, getCartSessionId } from "@/lib/cart-session";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  getCartItemCount,
} from "@/services/cart.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { CartWithItems } from "@/services/cart.service";

// ── Input schemas ─────────────────────────────────────────────
const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
  selectedVariants: z.record(z.string()).default({}),
});

const updateQuantitySchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
});

const applyCouponSchema = z.object({
  code: z.string().min(1, "أدخل كود الكوبون").max(50),
});

// ── Helpers ───────────────────────────────────────────────────
async function getIdentifiers(): Promise<{
  userId: string | null;
  sessionId: string | null;
}> {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (userId) {
    // Authenticated — no need for session cookie
    return { userId, sessionId: null };
  }

  // Guest — use/create session cookie
  const sessionId = await getOrCreateCartSessionId();
  return { userId: null, sessionId };
}

async function getReadIdentifiers(): Promise<{
  userId: string | null;
  sessionId: string | null;
}> {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  if (userId) return { userId, sessionId: null };
  const sessionId = await getCartSessionId();
  return { userId: null, sessionId };
}

// ── Actions ───────────────────────────────────────────────────

export async function getCartAction(): Promise<{
  success: boolean;
  cart?: CartWithItems | null;
  itemCount: number;
  error?: string;
}> {
  try {
    const { userId, sessionId } = await getReadIdentifiers();
    const cart = await getCart(userId, sessionId);
    const itemCount = cart
      ? cart.items.reduce((s, i) => s + i.quantity, 0)
      : 0;
    return { success: true, cart, itemCount };
  } catch (err) {
    console.error("getCartAction:", err);
    return { success: false, cart: null, itemCount: 0, error: "فشل تحميل السلة" };
  }
}

export async function addToCartAction(
  input: unknown
): Promise<{ success: boolean; error?: string; itemCount?: number }> {
  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const { userId, sessionId } = await getIdentifiers();
    const result = await addToCart(
      userId,
      sessionId,
      parsed.data.productId,
      parsed.data.quantity,
      parsed.data.selectedVariants
    );

    if (!result.success) return { success: false, error: result.error };

    const itemCount = result.cart
      ? result.cart.items.reduce((s, i) => s + i.quantity, 0)
      : 0;

    revalidatePath("/cart");
    revalidatePath("/", "layout"); // refresh navbar count
    return { success: true, itemCount };
  } catch (err) {
    console.error("addToCartAction:", err);
    return { success: false, error: "فشل إضافة المنتج للسلة" };
  }
}

export async function updateCartItemAction(
  input: unknown
): Promise<{ success: boolean; error?: string; cart?: CartWithItems | null }> {
  const parsed = updateQuantitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const { userId, sessionId } = await getIdentifiers();
    const result = await updateCartItem(
      userId,
      sessionId,
      parsed.data.cartItemId,
      parsed.data.quantity
    );

    if (!result.success) return { success: false, error: result.error };

    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, cart: result.cart };
  } catch (err) {
    console.error("updateCartItemAction:", err);
    return { success: false, error: "فشل تحديث الكمية" };
  }
}

export async function removeCartItemAction(
  cartItemId: string
): Promise<{ success: boolean; error?: string; cart?: CartWithItems | null }> {
  if (!cartItemId) return { success: false, error: "معرف العنصر مطلوب" };

  try {
    const { userId, sessionId } = await getIdentifiers();
    const result = await removeCartItem(userId, sessionId, cartItemId);

    if (!result.success) return { success: false, error: result.error };

    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, cart: result.cart };
  } catch (err) {
    console.error("removeCartItemAction:", err);
    return { success: false, error: "فشل حذف المنتج من السلة" };
  }
}

export async function clearCartAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, sessionId } = await getIdentifiers();
    await clearCart(userId, sessionId);

    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("clearCartAction:", err);
    return { success: false, error: "فشل مسح السلة" };
  }
}

export async function applyCouponAction(
  input: unknown
): Promise<{ success: boolean; discountInCents: number; error?: string }> {
  const parsed = applyCouponSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, discountInCents: 0, error: parsed.error.errors[0].message };
  }

  try {
    const { userId, sessionId } = await getReadIdentifiers();
    return await applyCoupon(userId, sessionId, parsed.data.code);
  } catch (err) {
    console.error("applyCouponAction:", err);
    return { success: false, discountInCents: 0, error: "فشل تطبيق الكوبون" };
  }
}

export async function getCartCountAction(): Promise<number> {
  try {
    const { userId, sessionId } = await getReadIdentifiers();
    return await getCartItemCount(userId, sessionId);
  } catch {
    return 0;
  }
}
