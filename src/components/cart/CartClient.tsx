"use client";

import { useEffect, useState, useTransition } from "react";
import { CartStoreGroup, CartSummary } from "./CartItem";
import { EmptyState } from "@/components/common/EmptyState";
import { buildWhatsAppOrderMessage, buildWhatsAppUrl } from "@/lib/utils";
import {
  updateCartItemAction,
  removeCartItemAction,
  clearCartAction,
  applyCouponAction,
} from "@/actions/cart.actions";
import { placeOrderAction } from "@/actions/order.actions";
import { useCartStore } from "@/stores/cart.store";
import type { CartWithItems } from "@/services/cart.service";

interface CartClientProps {
  initialCart: CartWithItems | null;
}

export default function CartClient({ initialCart }: CartClientProps) {
  const { cart, setCart, subtotalInCents } = useCartStore();
  const [isPending, startTransition] = useTransition();

  // Toast state
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Coupon state
  const [couponCode,    setCouponCode]    = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError,   setCouponError]   = useState("");
  const [discountInCents, setDiscountInCents] = useState(0);

  // Order state
  const [orderPlaced,   setOrderPlaced]   = useState(false);
  const [orderNumber,   setOrderNumber]   = useState("");

  // Hydrate store from server-fetched data
  useEffect(() => {
    setCart(initialCart);
  }, [initialCart, setCart]);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Handlers ────────────────────────────────────────────────
  const handleQuantityChange = (cartItemId: string, qty: number) => {
    startTransition(async () => {
      const result = await updateCartItemAction({ cartItemId, quantity: qty });
      if (result.success) {
        setCart(result.cart ?? null);
      } else {
        showToast(result.error ?? "حدث خطأ", "error");
      }
    });
  };

  const handleRemove = (cartItemId: string) => {
    startTransition(async () => {
      const result = await removeCartItemAction(cartItemId);
      if (result.success) {
        setCart(result.cart ?? null);
        showToast("تم حذف المنتج من السلة");
      } else {
        showToast(result.error ?? "حدث خطأ", "error");
      }
    });
  };

  const handleClearCart = () => {
    startTransition(async () => {
      const result = await clearCartAction();
      if (result.success) {
        setCart(null);
        setDiscountInCents(0);
        setCouponApplied(false);
        setCouponCode("");
        showToast("تم مسح السلة");
      } else {
        showToast(result.error ?? "حدث خطأ", "error");
      }
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) { setCouponError("أدخل كود الكوبون"); return; }
    setCouponError("");
    startTransition(async () => {
      const result = await applyCouponAction({ code: couponCode });
      if (result.success) {
        setDiscountInCents(result.discountInCents);
        setCouponApplied(true);
        showToast("تم تطبيق الكوبون بنجاح");
      } else {
        setCouponError(result.error ?? "كوبون غير صحيح");
      }
    });
  };

  const handleWhatsAppOrder = () => {
    startTransition(async () => {
      // Save order to DB first, then open WA
      const result = await placeOrderAction({
        discountInCents,
        couponCode: couponApplied ? couponCode : undefined,
      });

      if (!result.success) {
        showToast(result.error ?? "فشل إنشاء الطلب", "error");
        return;
      }

      // Clear local cart state
      setCart(null);
      setOrderPlaced(true);
      setOrderNumber(result.orderNumber ?? "");

      // Open WhatsApp
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    });
  };

  // Use Zustand cart (updated by actions) falling back to server-rendered initial
  const displayCart = cart;

  // ── Render ───────────────────────────────────────────────────
  // ── Order success state ─────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 pb-12">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-[24px] font-black text-secondary mb-2">تم إرسال طلبك!</h2>
          {orderNumber && (
            <div className="inline-block bg-primary-ultra text-primary font-bold text-[14px] px-4 py-2 rounded-full mb-4">
              رقم الطلب: {orderNumber}
            </div>
          )}
          <p className="text-gray-500 text-[14px] mb-2 leading-relaxed">
            تم فتح واتساب لإرسال تفاصيل طلبك لصاحب المتجر مباشرةً.
          </p>
          <p className="text-gray-400 text-[13px] mb-8">
            إذا لم يفتح واتساب تلقائياً، يمكنك التواصل مع المتجر مباشرةً.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="/stores" className="btn btn-primary no-underline">متابعة التسوق</a>
            <a href="/dashboard/customer?tab=orders" className="btn btn-outline no-underline">عرض طلباتي</a>
          </div>
        </div>
      </div>
    );
  }

  if (!displayCart || displayCart.items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 pb-12">
        <EmptyState
          icon="🛒"
          title="سلتك فارغة!"
          description="لم تضف أي منتجات بعد. ابدأ التسوق الآن."
          action={{ label: "استكشف المتاجر", href: "/stores" }}
        />
      </div>
    );
  }

  const storeName  = displayCart.store?.name  ?? "";
  const storeSlug  = displayCart.store?.slug  ?? "";
  const subtotal   = subtotalInCents();
  const totalItems = displayCart.items.reduce((s, i) => s + i.quantity, 0);

  // Build CartItemData shape expected by CartStoreGroup
  const cartItems = displayCart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    selectedVariants: (item.selectedVariants as Record<string, string>) ?? {},
    product: {
      id:           item.product.id,
      name:         item.product.name,
      priceInCents: item.product.priceInCents,
      images:       item.product.images,
      store:        item.product.store,
    },
  }));

  return (
    <div className="max-w-[1280px] mx-auto px-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-[16px] shadow-xl text-white text-[13px] font-bold animate-fade-up ${
          toast.type === "error" ? "bg-danger" : "bg-success"
        }`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Items column */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h1 className="text-[24px] font-black text-secondary">
              🛒 سلة التسوق{" "}
              <span className="text-[16px] font-medium text-gray-400">
                ({totalItems} {totalItems === 1 ? "منتج" : "منتجات"})
              </span>
            </h1>
            <button
              onClick={handleClearCart}
              disabled={isPending}
              className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-danger border border-gray-200 hover:border-danger rounded-[10px] px-3 py-1.5 transition-all bg-white cursor-pointer disabled:opacity-50"
            >
              🗑️ مسح السلة
            </button>
          </div>

          {/* Single-store warning */}
          <div className="bg-primary-ultra border border-primary/20 rounded-[16px] p-4 mb-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">ℹ️</span>
            <p className="text-[13px] text-primary leading-relaxed">
              <strong>تنبيه:</strong> السلة مقفلة على متجر واحد فقط.
              لإضافة منتجات من متجر آخر، أكمل هذا الطلب أولاً.
            </p>
          </div>

          {/* Store group */}
          <CartStoreGroup
            storeName={storeName}
            storeSlug={storeSlug}
            items={cartItems}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
          />

          {/* Coupon */}
          <div className="bg-white rounded-[24px] border border-gray-100 p-5 mb-4">
            <div className="text-[14px] font-black text-secondary mb-3">🎟️ كوبون الخصم</div>
            {couponApplied ? (
              <div className="bg-success-light text-green-700 rounded-[10px] px-4 py-3 text-[13px] font-bold">
                ✅ تم تطبيق الكوبون — خصم {discountInCents / 100} ج.م
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="أدخل كود الكوبون..."
                    className="flex-1 form-input"
                    disabled={isPending}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isPending}
                    className="btn btn-primary px-5 disabled:opacity-60"
                  >
                    {isPending ? "..." : "تطبيق"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-danger text-[12px]">{couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* WA message preview */}
          <div className="bg-white rounded-[24px] border border-gray-100 p-5">
            <div className="text-[14px] font-black text-secondary mb-3">
              💬 رسالة الطلب على واتساب
            </div>
            <div className="bg-[#ECE5DD] rounded-[16px] p-4">
              <div className="bg-[#DCF8C6] rounded-[0_12px_12px_12px] p-3 text-[12px] leading-[1.9] text-secondary max-w-[80%] font-mono whitespace-pre-wrap">
                {buildWhatsAppOrderMessage({
                  storeName,
                  items: displayCart.items.map((i) => ({
                    name:         i.product.name,
                    quantity:     i.quantity,
                    priceInCents: i.product.priceInCents,
                    variants:     Object.keys(i.selectedVariants).length > 0
                      ? (i.selectedVariants as Record<string, string>)
                      : undefined,
                  })),
                  totalInCents: subtotal - discountInCents,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <CartSummary
          storeName={storeName}
          subtotal={subtotal}
          discount={discountInCents}
          couponCode={couponApplied ? couponCode : undefined}
          onWhatsAppOrder={handleWhatsAppOrder}
          loading={isPending}
        />
      </div>
    </div>
  );
}
