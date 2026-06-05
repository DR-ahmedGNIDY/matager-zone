"use client";
import { useState } from "react";
import ReviewCard from "@/components/store/ReviewCard";
import StarRating from "@/components/common/StarRating";
import { cn } from "@/lib/utils";

interface ProductTabsProps {
  description?: string | null;
  sku?: string | null;
  tags?: string[];
  reviews: Array<{
    id: string; rating: number; comment?: string | null; createdAt: Date | string;
    user: { id: string; name?: string | null; image?: string | null };
  }>;
  averageRating?: number;
}

export default function ProductTabs({ description, sku, tags = [], reviews, averageRating }: ProductTabsProps) {
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const TABS = [
    { id: "desc",    label: "الوصف"  },
    { id: "specs",   label: "المواصفات" },
    { id: "reviews", label: `التقييمات (${reviews.length})` },
  ] as const;

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-4 text-[14px] font-bold transition-all border-none cursor-pointer border-b-2 -mb-px",
              tab === t.id
                ? "text-primary border-primary bg-primary-ultra"
                : "text-gray-500 border-transparent hover:text-primary bg-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Description */}
        {tab === "desc" && (
          <div className="text-[14px] text-gray-600 leading-[1.9]">
            {description || "لا يوجد وصف تفصيلي لهذا المنتج."}
          </div>
        )}

        {/* Specs */}
        {tab === "specs" && (
          <div className="flex flex-col gap-2.5">
            {sku && (
              <div className="flex justify-between py-2.5 border-b border-gray-100 text-[13px]">
                <span className="text-gray-500">رقم SKU</span>
                <span className="font-semibold text-secondary">{sku}</span>
              </div>
            )}
            {tags.map((tag) => (
              <div key={tag} className="flex justify-between py-2.5 border-b border-gray-100 text-[13px]">
                <span className="text-gray-500">تصنيف</span>
                <span className="font-semibold text-secondary">{tag}</span>
              </div>
            ))}
            {!sku && tags.length === 0 && (
              <p className="text-gray-400 text-center py-4 text-[14px]">لا توجد مواصفات متاحة.</p>
            )}
          </div>
        )}

        {/* Reviews */}
        {tab === "reviews" && (
          <div>
            {averageRating && averageRating > 0 && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                <span className="text-[40px] font-black text-secondary leading-none">{averageRating.toFixed(1)}</span>
                <div>
                  <StarRating value={Math.round(averageRating)} readonly size="md" />
                  <span className="text-[12px] text-gray-400 mt-0.5 block">من {reviews.length} تقييم</span>
                </div>
              </div>
            )}
            {reviews.length === 0
              ? <p className="text-gray-400 text-center py-6 text-[14px]">لا توجد تقييمات بعد.</p>
              : reviews.map((r) => <ReviewCard key={r.id} review={r} />)
            }
          </div>
        )}
      </div>
    </div>
  );
}
