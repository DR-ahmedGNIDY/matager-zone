/**
 * CartService — all cart database operations.
 *
 * Design decisions:
 * - Authenticated users:  cart keyed by userId (unique)
 * - Guest users:          cart keyed by sessionId cookie
 * - Single-store rule:    adding a product from a different store clears the cart first
 * - On login:             guest cart is merged into the user's cart then session is cleared
 * - Prices:               always read from DB (not trusted from client)
 */

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────

export interface CartWithItems {
  id: string;
  storeId: string | null;
  store: {
    id: string;
    name: string;
    slug: string;
    whatsappNumber: string;
    countryCode: string;
  } | null;
  items: CartItemFull[];
}

export interface CartItemFull {
  id: string;
  quantity: number;
  selectedVariants: Record<string, string>;
  product: {
    id: string;
    name: string;
    priceInCents: number;
    comparePriceInCents: number | null;
    status: string;
    stock: number | null;
    trackStock: boolean;
    images: { url: string; alt: string | null }[];
    store: {
      id: string;
      name: string;
      slug: string;
      whatsappNumber: string;
      countryCode: string;
    };
  };
}

// Prisma include shape (reused to avoid duplication)
const CART_INCLUDE = {
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      whatsappNumber: true,
      countryCode: true,
    },
  },
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          priceInCents: true,
          comparePriceInCents: true,
          status: true,
          stock: true,
          trackStock: true,
          images: {
            take: 1,
            orderBy: { order: "asc" as const },
            select: { url: true, alt: true },
          },
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              whatsappNumber: true,
              countryCode: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

// ── Lookup helpers ────────────────────────────────────────────────────────

async function findCart(
  userId: string | null,
  sessionId: string | null
) {
  if (userId) {
    return db.cart.findUnique({
      where: { userId },
      include: CART_INCLUDE,
    });
  }
  if (sessionId) {
    return db.cart.findUnique({
      where: { sessionId },
      include: CART_INCLUDE,
    });
  }
  return null;
}

async function getOrCreateCart(
  userId: string | null,
  sessionId: string | null
) {
  const existing = await findCart(userId, sessionId);
  if (existing) return existing;

  // Create a new empty cart
  return db.cart.create({
    data: {
      ...(userId    ? { userId }    : {}),
      ...(sessionId ? { sessionId } : {}),
    },
    include: CART_INCLUDE,
  });
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Get current cart (null if empty / not found).
 */
export async function getCart(
  userId: string | null,
  sessionId: string | null
): Promise<CartWithItems | null> {
  const cart = await findCart(userId, sessionId);
  if (!cart || cart.items.length === 0) return null;
  return cart as unknown as CartWithItems;
}

/**
 * Add item to cart.
 * - Validates product exists and is ACTIVE.
 * - Enforces single-store rule (clears cart if different store).
 * - Enforces stock limit if trackStock is true.
 * - Increments quantity if item already in cart.
 */
export async function addToCart(
  userId: string | null,
  sessionId: string | null,
  productId: string,
  quantity: number,
  selectedVariants: Record<string, string>
): Promise<{ success: boolean; error?: string; cart?: CartWithItems }> {
  // Validate inputs
  if (quantity < 1 || quantity > 99) {
    return { success: false, error: "الكمية يجب أن تكون بين 1 و 99" };
  }
  if (!userId && !sessionId) {
    return { success: false, error: "لم يتم العثور على الجلسة" };
  }

  // Fetch product (trusted DB price — never trust client)
  const product = await db.product.findFirst({
    where: { id: productId, status: "ACTIVE", deletedAt: null },
    select: {
      id: true,
      storeId: true,
      name: true,
      priceInCents: true,
      stock: true,
      trackStock: true,
      store: { select: { id: true, status: true } },
    },
  });

  if (!product) {
    return { success: false, error: "المنتج غير موجود أو غير متاح" };
  }
  if (product.store.status !== "ACTIVE") {
    return { success: false, error: "المتجر غير نشط" };
  }

  const cart = await getOrCreateCart(userId, sessionId);

  // Single-store rule: if cart has a different store, clear it first
  if (cart.storeId && cart.storeId !== product.storeId) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    await db.cart.update({
      where: { id: cart.id },
      data: { storeId: product.storeId },
    });
  }

  // Set storeId on new/cleared cart
  if (!cart.storeId) {
    await db.cart.update({
      where: { id: cart.id },
      data: { storeId: product.storeId },
    });
  }

  // Check if item already exists
  const existing = await db.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  const newQty = existing ? existing.quantity + quantity : quantity;

  // Stock check
  if (product.trackStock && product.stock !== null) {
    if (newQty > product.stock) {
      return {
        success: false,
        error: `المخزون المتاح ${product.stock} قطعة فقط`,
      };
    }
  }

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: newQty,
        selectedVariants: selectedVariants as unknown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        selectedVariants: selectedVariants as unknown as Prisma.InputJsonValue,
      },
    });
  }

  const updated = await findCart(userId, sessionId);
  return { success: true, cart: updated as unknown as CartWithItems };
}

/**
 * Update item quantity. quantity = 0 removes the item.
 */
export async function updateCartItem(
  userId: string | null,
  sessionId: string | null,
  cartItemId: string,
  quantity: number
): Promise<{ success: boolean; error?: string; cart?: CartWithItems }> {
  if (quantity < 0 || quantity > 99) {
    return { success: false, error: "الكمية غير صحيحة" };
  }

  // Verify item belongs to this cart
  const item = await db.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: {
        ...(userId    ? { userId }    : {}),
        ...(sessionId ? { sessionId } : {}),
      },
    },
    include: { product: { select: { stock: true, trackStock: true } } },
  });

  if (!item) {
    return { success: false, error: "العنصر غير موجود في السلة" };
  }

  // Stock check on increase
  if (
    quantity > 0 &&
    item.product.trackStock &&
    item.product.stock !== null &&
    quantity > item.product.stock
  ) {
    return {
      success: false,
      error: `المخزون المتاح ${item.product.stock} قطعة فقط`,
    };
  }

  if (quantity === 0) {
    await db.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity, updatedAt: new Date() },
    });
  }

  // If cart is now empty, clear storeId
  const remaining = await db.cartItem.count({
    where: { cart: { ...(userId ? { userId } : { sessionId: sessionId! }) } },
  });
  if (remaining === 0) {
    await db.cart.updateMany({
      where: { ...(userId ? { userId } : { sessionId: sessionId! }) },
      data: { storeId: null },
    });
  }

  const updated = await findCart(userId, sessionId);
  return { success: true, cart: updated as unknown as CartWithItems };
}

/**
 * Remove a single item from cart.
 */
export async function removeCartItem(
  userId: string | null,
  sessionId: string | null,
  cartItemId: string
): Promise<{ success: boolean; error?: string; cart?: CartWithItems }> {
  return updateCartItem(userId, sessionId, cartItemId, 0);
}

/**
 * Clear entire cart.
 */
export async function clearCart(
  userId: string | null,
  sessionId: string | null
): Promise<{ success: boolean }> {
  const cart = await findCart(userId, sessionId);
  if (!cart) return { success: true };

  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  await db.cart.update({
    where: { id: cart.id },
    data: { storeId: null },
  });
  return { success: true };
}

/**
 * Apply coupon code.
 * Returns discount amount in piastres (or 0 + error).
 */
export async function applyCoupon(
  userId: string | null,
  sessionId: string | null,
  code: string
): Promise<{ success: boolean; discountInCents: number; error?: string }> {
  const cart = await findCart(userId, sessionId);
  if (!cart || !cart.storeId) {
    return { success: false, discountInCents: 0, error: "السلة فارغة" };
  }

  const coupon = await db.coupon.findFirst({
    where: {
      code: code.toUpperCase().trim(),
      storeId: cart.storeId,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  if (!coupon) {
    return { success: false, discountInCents: 0, error: "الكوبون غير صحيح أو منتهي الصلاحية" };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { success: false, discountInCents: 0, error: "تم استنفاد هذا الكوبون" };
  }

  // Calculate subtotal (prices always from DB)
  const subtotal = (cart as unknown as CartWithItems).items.reduce(
    (sum, item) => sum + item.product.priceInCents * item.quantity,
    0
  );

  if (coupon.minOrderValueInCents && subtotal < coupon.minOrderValueInCents) {
    return {
      success: false,
      discountInCents: 0,
      error: `الحد الأدنى للطلب ${coupon.minOrderValueInCents / 100} ج.م`,
    };
  }

  let discountInCents = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountInCents = Math.round((subtotal * coupon.discountValue) / 100);
  } else {
    discountInCents = Math.min(coupon.discountValue, subtotal);
  }

  return { success: true, discountInCents };
}

/**
 * Merge guest cart into user cart on login.
 * Called from auth event after sign-in.
 */
export async function mergeGuestCartIntoUserCart(
  userId: string,
  sessionId: string
): Promise<void> {
  const guestCart = await db.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await db.cart.findUnique({ where: { userId } });

  if (!userCart) {
    // Simply reassign the guest cart to the user
    await db.cart.update({
      where: { id: guestCart.id },
      data: { userId, sessionId: null },
    });
    return;
  }

  // Both carts exist — single-store rule applies
  // Guest cart wins if stores differ (user is actively shopping)
  if (guestCart.storeId && userCart.storeId && guestCart.storeId !== userCart.storeId) {
    // Clear user cart and move guest items over
    await db.cartItem.deleteMany({ where: { cartId: userCart.id } });
    await db.cart.update({
      where: { id: userCart.id },
      data: { storeId: guestCart.storeId },
    });
  }

  // Move guest items into user cart
  for (const item of guestCart.items) {
    await db.cartItem.upsert({
      where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
      create: {
        cartId: userCart.id,
        productId: item.productId,
        quantity: item.quantity,
        selectedVariants:
  (item.selectedVariants ?? {}) as Prisma.InputJsonValue,
      },
      update: {
        quantity: item.quantity,
        selectedVariants:
  (item.selectedVariants ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  // Delete guest cart
  await db.cart.delete({ where: { id: guestCart.id } });
}

/**
 * Get item count for navbar badge.
 */
export async function getCartItemCount(
  userId: string | null,
  sessionId: string | null
): Promise<number> {
  if (!userId && !sessionId) return 0;
  const cart = await findCart(userId, sessionId);
  if (!cart) return 0;
  return (cart.items as { quantity: number }[]).reduce(
    (sum, item) => sum + item.quantity, 0
  );
}
