"use client";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { QuantityControl } from "@/components/product/VariantSelector";

// ── CartItem ───────────────────────────────────────────────────
export interface CartItemData {
  id: string;
  quantity: number;
  selectedVariants: Record<string, string>;
  product: {
    id: string; name: string; priceInCents: number;
    images?: { url: string }[];
    store: { name: string; slug: string };
  };
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const hasImage = item.product.images && item.product.images.length > 0;
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-[88px] h-[88px] rounded-[12px] bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {hasImage ? (
          <Image src={item.product.images![0].url} alt={item.product.name} width={88} height={88} className="object-contain p-1" />
        ) : <span className="text-3xl">📦</span>}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-secondary mb-0.5 line-clamp-2">{item.product.name}</div>
        <div className="text-[12px] text-gray-400 mb-2">{item.product.store.name}</div>
        {/* Variants */}
        {Object.entries(item.selectedVariants).map(([k, v]) => (
          <span key={k} className="inline-block text-[11px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 mr-1">{k}: {v}</span>
        ))}
        <div className="flex items-center justify-between mt-2.5 flex-wrap gap-2">
          <QuantityControl value={item.quantity} onChange={(q) => onQuantityChange(item.id, q)} />
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-black text-secondary">{formatPrice(item.product.priceInCents * item.quantity)}</span>
            <button onClick={() => onRemove(item.id)}
              className="text-gray-400 hover:text-danger text-[12px] border-none bg-none cursor-pointer transition-colors">🗑</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CartStoreGroup ─────────────────────────────────────────────
interface CartStoreGroupProps {
  storeName: string;
  storeSlug: string;
  items: CartItemData[];
  onQuantityChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartStoreGroup({ storeName, storeSlug, items, onQuantityChange, onRemove }: CartStoreGroupProps) {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
        <span className="text-xl">🏪</span>
        <a href={`/store/${storeSlug}`} className="text-[14px] font-black text-secondary hover:text-primary transition-colors no-underline">{storeName}</a>
        <span className="text-[12px] text-gray-400 mr-auto">{items.length} منتجات</span>
      </div>
      <div className="px-5">
        {items.map((item) => (
          <CartItem key={item.id} item={item} onQuantityChange={onQuantityChange} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}

// ── CartSummary ────────────────────────────────────────────────
interface CartSummaryProps {
  storeName: string;
  subtotal: number;
  discount?: number;
  couponCode?: string;
  onWhatsAppOrder: () => void;
  loading?: boolean;
}

export function CartSummary({ storeName, subtotal, discount = 0, couponCode, onWhatsAppOrder, loading }: CartSummaryProps) {
  const total = subtotal - discount;
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden sticky top-[84px]">
      <div className="px-5 py-4 border-b border-gray-100 font-black text-[15px] text-secondary">📋 ملخص الطلب</div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">المتجر</span>
          <span className="font-semibold text-secondary">🏪 {storeName}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">المجموع الفرعي</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[13px] text-success">
            <span>خصم الكوبون</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="h-px bg-gray-100" />
        <div className="flex justify-between text-[15px] font-black">
          <span>الإجمالي</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
        <div className="bg-primary-ultra rounded-[10px] p-3 text-[12px] text-primary font-medium text-center">
          🚀 الطلب يصل مباشرة عبر واتساب — بدون دفع مسبق
        </div>
        <button
          onClick={onWhatsAppOrder}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-wa hover:bg-wa-dark disabled:opacity-60 text-white font-black text-[16px] py-4 rounded-[16px] border-none cursor-pointer transition-all"
          style={{ boxShadow: "0 8px 24px rgba(37,211,102,.3)" }}
        >
          {loading ? "جاري التجهيز..." : "💬 إتمام الطلب عبر واتساب"}
        </button>
      </div>
    </div>
  );
}
