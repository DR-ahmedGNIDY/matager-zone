"use server";

import { auth } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { getCart } from "@/services/cart.service";
import { createOrderFromCart, createDirectOrder } from "@/services/order.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Place order from cart ─────────────────────────────────────

const placeOrderSchema = z.object({
  notes:           z.string().max(500).optional(),
  couponCode:      z.string().max(50).optional(),
  discountInCents: z.number().int().min(0).default(0),
});

export async function placeOrderAction(input: unknown): Promise<{
  success:      boolean;
  orderNumber?: string;
  whatsappUrl?: string;
  error?:       string;
}> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const session   = await auth();
  const userId    = session?.user?.id ?? null;
  const sessionId = userId ? null : await getCartSessionId();

  // Always re-fetch cart from DB — never trust client data
  const cart = await getCart(userId, sessionId);
  if (!cart || !cart.items.length) {
    return { success: false, error: "السلة فارغة" };
  }

  const result = await createOrderFromCart(
    cart,
    userId,
    parsed.data.notes,
    parsed.data.couponCode,
    parsed.data.discountInCents
  );

  // Clear the cart after successful order
  if (result.success) {
    const { clearCart } = await import("@/services/cart.service");
    await clearCart(userId, sessionId).catch(() => {});
  }

  if (result.success) {
    revalidatePath("/cart");
    revalidatePath("/dashboard/customer");
    revalidatePath("/", "layout");
  }

  return {
    success:      result.success,
    orderNumber:  result.orderNumber,
    whatsappUrl:  result.whatsappUrl,
    error:        result.error,
  };
}

// ── Place direct order from product page ─────────────────────

const directOrderSchema = z.object({
  productId:        z.string().min(1),
  quantity:         z.number().int().min(1).max(99),
  selectedVariants: z.record(z.string()).default({}),
  notes:            z.string().max(500).optional(),
});

export async function placeDirectOrderAction(input: unknown): Promise<{
  success:      boolean;
  orderNumber?: string;
  whatsappUrl?: string;
  error?:       string;
}> {
  const parsed = directOrderSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const session  = await auth();
  const userId   = session?.user?.id ?? null;

  const result = await createDirectOrder({
    productId:        parsed.data.productId,
    quantity:         parsed.data.quantity,
    selectedVariants: parsed.data.selectedVariants,
    customerId:       userId,
    notes:            parsed.data.notes,
  });

  if (result.success) {
    revalidatePath("/dashboard/customer");
  }

  return {
    success:     result.success,
    orderNumber: result.orderNumber,
    whatsappUrl: result.whatsappUrl,
    error:       result.error,
  };
}
