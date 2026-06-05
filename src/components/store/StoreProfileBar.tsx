"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toggleFollowStoreAction } from "@/actions/wishlist.actions";
import { Badge } from "@/components/common/Badge";
import { buildWhatsAppUrl } from "@/lib/utils";

interface StoreProfileBarProps {
  store: {
    id: string;
    name: string; logo?: string | null; slug: string;
    isVerified?: boolean; isFeatured?: boolean;
    city?: string | null; country?: string | null;
    whatsappNumber: string; countryCode?: string;
    createdAt: string | Date;
  };
  category?: { nameAr: string; emoji: string } | null;
  initialFollowing?: boolean;
}

export default function StoreProfileBar({ store, category, initialFollowing = false }: StoreProfileBarProps) {
  const [followed, setFollowed] = useState(initialFollowing);
  const [, startTransition] = useTransition();
  const phone = (store.countryCode || "20") + store.whatsappNumber;
  const waMsg = `السلام عليكم\nأريد الاستفسار عن متجر ${store.name}\nشكراً`;

  const createdYear = new Date(store.createdAt).getFullYear();

  return (
    <div className="bg-white border-b border-gray-100 sticky top-[68px] z-[100]">
      <div className="max-w-[1280px] mx-auto px-6 flex items-center gap-5 min-h-[76px] flex-wrap py-2">

        {/* Avatar */}
        <div className="w-[72px] h-[72px] bg-white rounded-[18px] border-[3px] border-white shadow-md flex items-center justify-center text-[32px] flex-shrink-0 -mt-9">
          {store.logo
            ? <Image src={store.logo} alt={store.name} width={72} height={72} className="w-full h-full object-contain rounded-[14px]" />
            : <span>🏪</span>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[20px] font-black text-secondary truncate">{store.name}</span>
            {store.isVerified && <Badge variant="verified">✓ موثق</Badge>}
            {store.isFeatured && <Badge variant="featured">⭐ مميز</Badge>}
          </div>
          <div className="text-[13px] text-gray-400 mt-0.5">
            {category ? `${category.emoji} ${category.nameAr}` : ""}
            {store.city ? ` · ${store.city}،` : ""}
            {store.country ? ` ${store.country}` : ""}
            {` · عضو منذ ${createdYear}`}
          </div>
        </div>

        {/* Tabs - hidden on small screens */}
        <nav className="hidden md:flex gap-0.5 mr-auto overflow-x-auto">
          {[
            { label: "المنتجات", href: "#products" },
            { label: "عن المتجر", href: "#about" },
            { label: "التقييمات", href: "#reviews" },
          ].map((tab) => (
            <a key={tab.label} href={tab.href}
              className="px-4 py-2 rounded-[10px] text-[13px] font-semibold text-gray-500 hover:bg-primary-ultra hover:text-primary transition-all no-underline whitespace-nowrap">
              {tab.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
                // Optimistic
                setFollowed((prev) => !prev);
                startTransition(async () => {
                  const result = await toggleFollowStoreAction(store.id);
                  if (!result.success) {
                    setFollowed((prev) => !prev); // rollback
                    if (result.requiresAuth) {
                      window.location.href = "/login?callbackUrl=" + window.location.pathname;
                    }
                  }
                });
              }}
            className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-bold transition-all border ${
              followed
                ? "bg-success-light text-green-700 border-success"
                : "bg-white border-gray-200 text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {followed ? "✓ تمت المتابعة" : "+ متابعة"}
          </button>
          <a href={`tel:+${phone}`}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-bold bg-white border border-gray-200 hover:border-primary hover:text-primary text-secondary transition-all no-underline">
            📞 اتصال
          </a>
          <button
            onClick={() => window.open(buildWhatsAppUrl(phone, waMsg), "_blank")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-[13px] font-bold bg-wa hover:bg-wa-dark text-white transition-all border-none cursor-pointer"
          >
            💬 واتساب
          </button>
        </div>
      </div>
    </div>
  );
}
