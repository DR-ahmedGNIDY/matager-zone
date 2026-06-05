"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn, formatPrice, calculateDiscountPct, getProductUrl, buildWhatsAppUrl, buildSingleProductWhatsAppMessage } from "@/lib/utils";
import { APP_URL } from "@/lib/constants";
import { toggleWishlistAction } from "@/actions/wishlist.actions";


// Product image background gradients matching HTML
const IMG_BGRDS = [
  "linear-gradient(135deg,#f0f4ff,#dde5ff)",
  "linear-gradient(135deg,#fff8e0,#ffedbc)",
  "linear-gradient(135deg,#f0fff4,#d4fae0)",
  "linear-gradient(135deg,#fdf4ff,#f5d5ff)",
  "linear-gradient(135deg,#fff0f0,#ffd6d6)",
  "linear-gradient(135deg,#f0f9ff,#d0eeff)",
];

function getImgBg(id: string): string {
  return IMG_BGRDS[id.charCodeAt(0) % IMG_BGRDS.length];
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    priceInCents: number;
    comparePriceInCents?: number | null;
    status?: string;
    isFeatured?: boolean;
    images?: { url: string; alt?: string | null }[];
    store: {
      id: string;
      name: string;
      slug: string;
      whatsappNumber: string;
      countryCode?: string;
    };
  };
  onAddToWishlist?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({ product, onAddToWishlist, onAddToCart, isWishlisted = false }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const discount = product.comparePriceInCents
    ? calculateDiscountPct(product.priceInCents, product.comparePriceInCents)
    : 0;

  const phone = (product.store.countryCode || "20") + product.store.whatsappNumber;
  const productUrl = `${APP_URL}${getProductUrl(product.id)}`;

  const handleWaOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = buildSingleProductWhatsAppMessage({
      productName: product.name,
      priceInCents: product.priceInCents,
      storeName: product.store.name,
      productUrl,
    });
    window.open(buildWhatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
  };

  const [, startTransition] = useTransition();

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    // Optimistic UI update immediately
    setWishlisted((prev) => !prev);
    startTransition(async () => {
      const result = await toggleWishlistAction(product.id);
      if (!result.success) {
        // Roll back on error
        setWishlisted((prev) => !prev);
        if (result.requiresAuth) {
          window.location.href = "/login?callbackUrl=" + window.location.pathname;
        }
      } else {
        // Notify parent if provided
        onAddToWishlist?.(product.id);
      }
    });
  };

  const firstImage = product.images?.[0];

  return (
    <Link
      href={getProductUrl(product.id)}
      className="bg-white rounded-[16px] border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-md hover:border-transparent transition-all duration-300 no-underline block group"
    >
      {/* Image */}
      <div
        className="relative h-[160px] flex items-center justify-center overflow-hidden"
        style={firstImage ? undefined : { background: getImgBg(product.id) }}
      >
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.alt || product.name}
            fill
            className="object-contain p-3"
          />
        ) : (
          <span className="text-5xl">📦</span>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 left-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
          aria-label={wishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart
            className={cn("w-3.5 h-3.5 transition-colors", wishlisted ? "fill-danger text-danger" : "text-gray-400")}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="text-[10px] text-primary font-bold mb-1">{product.store.name}</div>
        <div className="text-[13px] font-bold text-secondary line-clamp-2 leading-snug mb-2 min-h-[38px]">
          {product.name}
        </div>

        {/* Price */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[15px] font-black text-secondary">
            {formatPrice(product.priceInCents)}
          </span>
          {product.comparePriceInCents && (
            <span className="text-[11px] text-gray-400 line-through">
              {formatPrice(product.comparePriceInCents)}
            </span>
          )}
        </div>

        {/* WA order button */}
        <button
          onClick={handleWaOrder}
          className="w-full flex items-center justify-center gap-1.5 bg-primary-ultra hover:bg-primary hover:text-white text-primary rounded-[8px] py-2 text-[12px] font-bold transition-all"
        >
          💬 اطلب عبر واتساب
        </button>
      </div>
    </Link>
  );
}
