"use client";
import Link from "next/link";
import { useTransition } from "react";
import { toggleWishlistAction } from "@/actions/wishlist.actions";
import { formatPrice, formatRelativeTime, buildWhatsAppUrl } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";
import type { OrderStatus } from "@/types";


// ── OrderCard ──────────────────────────────────────────────────
interface OrderItem {
  id: string; productName: string; quantity: number;
  priceInCents: number; productImage?: string | null;
}

interface OrderCardProps {
  order: {
    id: string; orderNumber: string; status: OrderStatus;
    totalAmountInCents: number; itemCount: number; createdAt: Date | string;
    whatsappMessage: string;
    store: { name: string; slug: string; whatsappNumber: string; countryCode?: string };
    items?: OrderItem[];
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const cfg = ORDER_STATUS_CONFIG[order.status];
  const phone = (order.store.countryCode || "20") + order.store.whatsappNumber;

  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-[15px] font-black text-secondary">{order.orderNumber}</div>
          <div className="text-[12px] text-gray-400 mt-0.5">{formatRelativeTime(order.createdAt)}</div>
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[13px] text-gray-500 mb-4">
        <Link href={`/store/${order.store.slug}`} className="font-semibold text-primary hover:underline no-underline">{order.store.name}</Link>
        <span>·</span>
        <span>{order.itemCount} منتجات</span>
        <span>·</span>
        <span className="font-black text-secondary">{formatPrice(order.totalAmountInCents)}</span>
      </div>
      <button
        onClick={() => window.open(buildWhatsAppUrl(phone, order.whatsappMessage), "_blank")}
        className="w-full flex items-center justify-center gap-1.5 bg-wa hover:bg-wa-dark text-white py-2.5 rounded-[10px] text-[13px] font-bold transition-all border-none cursor-pointer"
      >
        💬 التواصل مع المتجر
      </button>
    </div>
  );
}

// ── WishlistGrid ──────────────────────────────────────────────
import ProductCard from "@/components/common/ProductCard";
import { EmptyState } from "@/components/common/EmptyState";

interface WishlistGridProps {
  items: Array<{
    id: string;
    product: {
      id: string; name: string; priceInCents: number; comparePriceInCents?: number | null;
      images?: { url: string; alt?: string | null }[];
      store: { id: string; name: string; slug: string; whatsappNumber: string; countryCode?: string };
    };
  }>;
  onRemove?: (id: string) => void;
}

export function WishlistGrid({ items, onRemove }: WishlistGridProps) {
  const [, startTransition] = useTransition();

  const handleRemove = (productId: string, itemId: string) => {
    startTransition(async () => {
      await toggleWishlistAction(productId);
      onRemove?.(itemId);
    });
  };

  if (!items.length) {
    return (
      <EmptyState icon="❤️" title="المفضلة فارغة"
        description="أضف منتجات للمفضلة من صفحات المنتجات"
        action={{ label: "استكشف المتاجر", href: "/stores" }} />
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          product={item.product}
          isWishlisted
          onAddToWishlist={() => handleRemove(item.product.id, item.id)}
        />
      ))}
    </div>
  );
}

// ── FollowedStores ────────────────────────────────────────────
import StoreCard from "@/components/common/StoreCard";

interface FollowedStoresProps {
  stores: Array<{
    id: string; name: string; slug: string; logo?: string | null; cover?: string | null;
    description?: string | null; primaryColor?: string; isVerified?: boolean; isFeatured?: boolean;
    whatsappNumber: string; countryCode?: string; city: string | null;
country: string | null;
    averageRating?: number;
    category?: { nameAr: string; emoji: string } | null;
    _count?: { products?: number; followers?: number };
  }>;
}

export function FollowedStores({ stores }: FollowedStoresProps) {
  if (!stores.length) {
    return (
      <EmptyState icon="🏪" title="لا توجد متاجر متابعة"
        description="تابع متاجرك المفضلة لتظهر هنا"
        action={{ label: "استكشف المتاجر", href: "/stores" }} />
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((store) => <StoreCard key={store.id} store={store} variant="grid" />)}
    </div>
  );
}
