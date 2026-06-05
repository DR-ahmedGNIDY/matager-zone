"use client";

import Link from "next/link";
import Image from "next/image";
import { cn, formatNumber, getStoreUrl, buildWhatsAppUrl, buildSingleProductWhatsAppMessage } from "@/lib/utils";

interface StoreCardProps {
  store: {
    id: string;
    name: string;
    slug: string;

    description?: string | null;
    logo?: string | null;
    cover?: string | null;

    primaryColor?: string | null;

    isVerified?: boolean | null;
    isFeatured?: boolean | null;

    whatsappNumber: string;

    countryCode?: string | null;
    city?: string | null;
    country?: string | null;

    category?: {
      nameAr: string;
      emoji: string;
    } | null;

    _count?: {
      products?: number;
      followers?: number;
    } | null;

    averageRating?: number | null;
  };

  variant?: "grid" | "list";
  coverClass?: string;
}

// Cover gradient fallbacks matching original design
const COVER_GRADIENTS = [
  "linear-gradient(135deg,#667EEA,#764BA2)",
  "linear-gradient(135deg,#F093FB,#F5576C)",
  "linear-gradient(135deg,#4FACFE,#00F2FE)",
  "linear-gradient(135deg,#43E97B,#38F9D7)",
  "linear-gradient(135deg,#FA709A,#FEE140)",
  "linear-gradient(135deg,#A18CD1,#FBC2EB)",
];

function getCoverGradient(id: string): string {
  const idx = id.charCodeAt(0) % COVER_GRADIENTS.length;
  return COVER_GRADIENTS[idx];
}

export default function StoreCard({ store, variant = "grid", coverClass }: StoreCardProps) {
  const coverStyle = store.cover
    ? undefined
    : { background: store.primaryColor ? `linear-gradient(135deg, ${store.primaryColor}, ${store.primaryColor}99)` : getCoverGradient(store.id) };

  const waMessage = `السلام عليكم\nأريد الاستفسار عن متجر ${store.name} على منصة متاجر زون\nشكراً`;
  const phone = (store.countryCode || "20") + store.whatsappNumber;

  if (variant === "list") {
    return (
      <Link
        href={getStoreUrl(store.slug)}
        className="bg-white rounded-[16px] border border-gray-100 flex overflow-hidden hover:shadow-md transition-all no-underline group"
      >
        {/* Cover side */}
        <div
          className="w-[180px] flex-shrink-0 flex items-center justify-center text-4xl relative overflow-hidden"
          style={coverStyle}
        >
          {store.cover && (
            <Image src={store.cover} alt={store.name} fill className="object-cover" />
          )}
          {!store.cover && <span className="text-5xl opacity-50">{store.category?.emoji || "🏪"}</span>}
        </div>

        {/* Body */}
        <div className="flex-1 p-5 flex gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[17px] font-black text-secondary group-hover:text-primary transition-colors">{store.name}</span>
              {store.isVerified && (
                <span className="inline-flex items-center gap-1 bg-success-light text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ موثق</span>
              )}
              {store.isFeatured && (
                <span className="inline-flex items-center gap-1 bg-warning-light text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ مميز</span>
              )}
            </div>
            {store.category && (
              <div className="text-[13px] text-gray-400 mb-2">{store.category.emoji} {store.category.nameAr}</div>
            )}
            {store.description && (
              <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-3">{store.description}</p>
            )}
            <div className="flex items-center gap-4">
              {store.averageRating ? (
                <span className="flex items-center gap-1 text-[12px] text-gray-500">
                  <span className="text-accent">★</span> {store.averageRating.toFixed(1)}
                </span>
              ) : null}
              {store._count?.products ? (
                <span className="text-[12px] text-gray-400">📦 {store._count.products} منتج</span>
              ) : null}
              {store._count?.followers ? (
                <span className="text-[12px] text-gray-400">👥 {formatNumber(store._count.followers)} متابع</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-center flex-shrink-0">
            <button
              onClick={(e) => { e.preventDefault(); window.open(buildWhatsAppUrl(phone, waMessage), "_blank"); }}
              className="flex items-center justify-center gap-1.5 bg-wa hover:bg-wa-dark text-white rounded-[10px] px-4 py-2 text-[12px] font-bold transition-all"
            >
              💬 واتساب
            </button>
            <Link href={getStoreUrl(store.slug)} className="flex items-center justify-center bg-gray-100 hover:bg-primary-ultra hover:text-primary text-gray-600 rounded-[10px] px-4 py-2 text-[12px] font-bold transition-all no-underline">
              زيارة المتجر
            </Link>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant (default) — matches store-card-g from HTML
  return (
    <Link
      href={getStoreUrl(store.slug)}
      className="bg-white rounded-[24px] border border-gray-100 overflow-hidden hover:-translate-y-[5px] hover:shadow-lg hover:border-transparent transition-all duration-300 no-underline block group"
    >
      {/* Cover */}
      <div
        className="h-[120px] relative flex items-center justify-center overflow-hidden"
        style={coverStyle}
      >
        {store.cover && <Image src={store.cover} alt={store.name} fill className="object-cover" />}
        {!store.cover && <span className="text-4xl opacity-40">{store.category?.emoji || "🏪"}</span>}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/35" />

        {/* Badges */}
        {store.isFeatured && (
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-warning-light text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ مميز</span>
          </div>
        )}
        {store.isVerified && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-success-light text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">✓ موثق</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        {/* Logo + info row */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-12 h-12 bg-white rounded-[10px] border-2 border-gray-100 flex items-center justify-center text-xl flex-shrink-0 -mt-8 shadow-sm">
            {store.logo
              ? <Image src={store.logo} alt={store.name} width={48} height={48} className="w-full h-full object-contain rounded-[8px]" />
              : <span>{store.category?.emoji || "🏪"}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-black text-secondary truncate group-hover:text-primary transition-colors">{store.name}</div>
            {store.category && <div className="text-[12px] text-gray-400 mt-0.5">{store.category.emoji} {store.category.nameAr}</div>}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2.5 mb-2.5">
          {store.averageRating ? (
            <span className="flex items-center gap-1 text-[12px] text-gray-500">
              <span className="text-accent">★</span> {store.averageRating.toFixed(1)}
            </span>
          ) : null}
          {store._count?.products ? (
            <><span className="text-gray-200">|</span><span className="text-[12px] text-gray-400">📦 {store._count.products} منتج</span></>
          ) : null}
          {store._count?.followers ? (
            <><span className="text-gray-200">|</span><span className="text-[12px] text-gray-400">👥 {formatNumber(store._count.followers)}</span></>
          ) : null}
        </div>

        {/* Description */}
        {store.description && (
          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-3">{store.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.preventDefault(); window.open(buildWhatsAppUrl(phone, waMessage), "_blank"); }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-wa hover:bg-wa-dark text-white rounded-[10px] py-2.5 text-[12px] font-bold transition-all"
          >
            💬 واتساب
          </button>
          <Link
            href={getStoreUrl(store.slug)}
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-primary-ultra hover:text-primary text-gray-600 rounded-[10px] transition-all no-underline text-sm"
          >
            ←
          </Link>
        </div>
      </div>
    </Link>
  );
}
