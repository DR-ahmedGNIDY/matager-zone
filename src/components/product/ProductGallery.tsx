"use client";
import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/actions/wishlist.actions";
import Image from "next/image";
import { calculateDiscountPct } from "@/lib/utils";

interface ProductGalleryProps {
  images: { url: string; alt?: string | null }[];
  productName: string;
  priceInCents: number;
  comparePriceInCents?: number | null;
  productId: string;
  onWishlist?: () => void;
  isWishlisted?: boolean; // server-rendered initial state
}

const IMG_BGRDS = [
  "linear-gradient(135deg,#f0f4ff,#dde5ff)",
  "linear-gradient(135deg,#fff8e0,#ffedbc)",
  "linear-gradient(135deg,#f0fff4,#d4fae0)",
];

export default function ProductGallery({
  images, productName, priceInCents, comparePriceInCents,
  productId, onWishlist, isWishlisted = false,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [, startTransition] = useTransition();

  const handleWishlistToggle = () => {
    setWishlisted((prev) => !prev); // optimistic
    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if (!result.success) {
        setWishlisted((prev) => !prev); // rollback
        if (result.requiresAuth) {
          window.location.href = "/login?callbackUrl=" + window.location.pathname;
        }
      } else {
        onWishlist?.();
      }
    });
  };
  const discount = comparePriceInCents ? calculateDiscountPct(priceInCents, comparePriceInCents) : 0;
  const bg = IMG_BGRDS[productId.charCodeAt(0) % IMG_BGRDS.length];
  const hasImages = images.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative rounded-[24px] overflow-hidden flex items-center justify-center"
        style={{ height: 420, background: hasImages ? undefined : bg }}
      >
        {hasImages ? (
          <Image
            src={images[active].url}
            alt={images[active].alt || productName}
            fill
            className="object-contain p-6"
            priority
          />
        ) : (
          <span className="text-8xl">📦</span>
        )}
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-accent text-white text-[13px] font-black px-3 py-1 rounded-full">
            -{discount}% خصم
          </div>
        )}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 left-4 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center text-lg hover:scale-110 transition-all border-none cursor-pointer"
          aria-label={wishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>
        <button
          onClick={() => navigator.share?.({ title: productName, url: window.location.href })}
          className="absolute top-14 left-4 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center text-sm hover:scale-110 transition-all border-none cursor-pointer"
        >
          ↗
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-[10px] overflow-hidden flex items-center justify-center flex-shrink-0 border-2 transition-all cursor-pointer bg-gray-50 ${
                i === active ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={img.alt || ""} width={64} height={64} className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
