/**
 * OrderService — creates and manages WhatsApp orders.
 *
 * Flow:
 * 1. Customer fills cart → clicks "إتمام الطلب عبر واتساب"
 * 2. createOrderFromCart() saves the order (status: NEW) to DB
 * 3. Returns the WhatsApp URL — client opens it
 * 4. Cart is cleared after order is placed
 *
 * Orders are NEVER paid online. They are fulfilled directly
 * between the customer and store owner via WhatsApp.
 */

import { db } from "@/lib/db";
import { generateOrderNumber, buildWhatsAppOrderMessage, buildWhatsAppUrl } from "@/lib/utils";
import { clearCart } from "@/services/cart.service";
import { createNotification } from "@/services/notification.service";
import type { CartWithItems } from "@/services/cart.service";

export interface PlaceOrderResult {
  success:      boolean;
  orderId?:     string;
  orderNumber?: string;
  whatsappUrl?: string;
  error?:       string;
}

/**
 * Create an order from the current cart and return the WhatsApp URL.
 * The cart is cleared on success.
 */
export async function createOrderFromCart(
  cart:       CartWithItems,
  customerId: string | null,
  notes?:     string,
  couponCode?: string,
  discountInCents = 0
): Promise<PlaceOrderResult> {
  if (!cart.store) return { success: false, error: "المتجر غير موجود في السلة" };
  if (!cart.items.length) return { success: false, error: "السلة فارغة" };

  const store = await db.store.findFirst({
    where: { id: cart.storeId!, status: "ACTIVE", deletedAt: null },
    select: {
      id: true, name: true, whatsappNumber: true, countryCode: true,
      orderButtonText: true, welcomeMessage: true,
    },
  });
  if (!store) return { success: false, error: "المتجر غير متاح حالياً" };

  // Build the WhatsApp message (used both in DB record and URL)
  const subtotal = cart.items.reduce(
    (s, i) => s + i.product.priceInCents * i.quantity, 0
  );
  const totalInCents = Math.max(0, subtotal - discountInCents);

  const whatsappMessage = buildWhatsAppOrderMessage({
    storeName: store.name,
    items: cart.items.map((i) => ({
      name:         i.product.name,
      quantity:     i.quantity,
      priceInCents: i.product.priceInCents,
      variants:
        i.selectedVariants && Object.keys(i.selectedVariants).length > 0
          ? (i.selectedVariants as Record<string, string>)
          : undefined,
    })),
    totalInCents,
    customerNote: notes?.trim() || undefined,
  });

  const orderNumber = generateOrderNumber();
  const phone       = (store.countryCode || "20") + store.whatsappNumber;

  try {
    const order = await db.$transaction(async (tx) => {
      // Create order record
      const o = await tx.order.create({
        data: {
          orderNumber,
          storeId:          store.id,
          customerId:       customerId ?? null,
          status:           "NEW",
          whatsappMessage,
          totalAmountInCents: totalInCents,
          itemCount:        cart.items.reduce((s, i) => s + i.quantity, 0),
          notes:            notes?.trim() || null,
        },
        select: { id: true },
      });

      // Create order items (price snapshot — never trust client)
      await tx.orderItem.createMany({
        data: cart.items.map((i) => ({
          orderId:          o.id,
          productId:        i.product.id,
          productName:      i.product.name,
          productImage:     i.product.images?.[0]?.url ?? null,
          quantity:         i.quantity,
          priceInCents:     i.product.priceInCents,   // snapshot from DB
          selectedVariants: (i.selectedVariants as object) ?? {},
        })),
      });

      // Increment store totalOrders counter atomically
      await tx.store.update({ where: { id: store.id }, data: { totalOrders: { increment: 1 } } });

      // Increment totalOrders on each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.product.id },
          data:  { totalOrders: { increment: item.quantity } },
        });
      }

      return o;
    });

    // Clear the cart (outside transaction — non-critical)
    // The cart was fetched with either userId or sessionId — clear with same identifier
    await clearCart(customerId, customerId ? null : null).catch(() => {});

    // Notify the store owner (non-critical)
    if (customerId) {
      await createNotification({
        userId:   customerId,
        title:    "تم إرسال طلبك! 🎉",
        message:  `طلبك رقم ${orderNumber} من ${store.name} تم إرساله عبر واتساب.`,
        type:     "ORDER",
        link:     "/dashboard/customer?tab=orders",
        metadata: { orderNumber, storeId: store.id },
      }).catch(() => {});
    }

    const waUrl = buildWhatsAppUrl(phone, whatsappMessage);

    return {
      success:      true,
      orderId:      order.id,
      orderNumber,
      whatsappUrl:  waUrl,
    };
  } catch (err) {
    console.error("createOrderFromCart:", err);
    return { success: false, error: "فشل في إنشاء الطلب، يرجى المحاولة مرة أخرى" };
  }
}

/**
 * Create a single-product order (direct from product page, bypassing cart).
 */
export async function createDirectOrder(params: {
  productId:        string;
  quantity:         number;
  selectedVariants: Record<string, string>;
  customerId:       string | null;
  notes?:           string;
}): Promise<PlaceOrderResult> {
  const { productId, quantity, selectedVariants, customerId, notes } = params;

  const product = await db.product.findFirst({
    where: { id: productId, status: "ACTIVE", deletedAt: null },
    select: {
      id: true, name: true, priceInCents: true,
      images: { take: 1, select: { url: true } },
      store: {
        select: {
          id: true, name: true, whatsappNumber: true,
          countryCode: true, status: true,
        },
      },
    },
  });

  if (!product)                          return { success: false, error: "المنتج غير متاح" };
  if (product.store.status !== "ACTIVE") return { success: false, error: "المتجر غير متاح" };

  const totalInCents = product.priceInCents * quantity;
  const store        = product.store;
  const phone        = (store.countryCode || "20") + store.whatsappNumber;
  const orderNumber  = generateOrderNumber();

  const whatsappMessage = buildWhatsAppOrderMessage({
    storeName: store.name,
    items: [{
      name:         product.name,
      quantity,
      priceInCents: product.priceInCents,
      variants:     Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
    }],
    totalInCents,
    customerNote: notes?.trim() || undefined,
  });

  try {
    const order = await db.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNumber,
          storeId:            store.id,
          customerId:         customerId ?? null,
          status:             "NEW",
          whatsappMessage,
          totalAmountInCents: totalInCents,
          itemCount:          quantity,
          notes:              notes?.trim() || null,
        },
        select: { id: true },
      });

      await tx.orderItem.create({
        data: {
          orderId:          o.id,
          productId:        product.id,
          productName:      product.name,
          productImage:     product.images?.[0]?.url ?? null,
          quantity,
          priceInCents:     product.priceInCents,
          selectedVariants: selectedVariants as object,
        },
      });

      await tx.store.update({ where: { id: store.id }, data: { totalOrders: { increment: 1 } } });
      await tx.product.update({
        where: { id: product.id },
        data:  { totalOrders: { increment: quantity } },
      });

      return o;
    });

    if (customerId) {
      await createNotification({
        userId:   customerId,
        title:    "تم إرسال طلبك! 🎉",
        message:  `طلبك رقم ${orderNumber} من ${store.name} تم إرساله.`,
        type:     "ORDER",
        link:     "/dashboard/customer?tab=orders",
        metadata: { orderNumber },
      }).catch(() => {});
    }

    return {
      success:     true,
      orderId:     order.id,
      orderNumber,
      whatsappUrl: buildWhatsAppUrl(phone, whatsappMessage),
    };
  } catch (err) {
    console.error("createDirectOrder:", err);
    return { success: false, error: "فشل في إنشاء الطلب" };
  }
}

/**
 * Get a customer's orders with store info.
 */
export async function getCustomerOrders(customerId: string, page = 1) {
  const take = 20;
  return db.order.findMany({
    where:   { customerId },
    orderBy: { createdAt: "desc" },
    skip:    (page - 1) * take,
    take,
    select: {
      id: true, orderNumber: true, status: true,
      totalAmountInCents: true, itemCount: true,
      whatsappMessage: true, notes: true,
      createdAt: true,
      store: {
        select: { id: true, name: true, slug: true, whatsappNumber: true, countryCode: true },
      },
      items: {
        select: {
          id: true, productName: true, quantity: true,
          priceInCents: true, productImage: true, selectedVariants: true,
        },
      },
    },
  });
}
