"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { STORE_CATEGORIES, COUNTRIES } from "@/lib/constants";

export default function StoreFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = (key: string, value: string | null) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`/stores?${params.toString()}`));
  };

  const clearAll = () => startTransition(() => router.push("/stores"));

  const cat      = sp.get("category") || "";
  const country  = sp.get("country")  || "";
  const rating   = sp.get("rating")   || "";
  const verified = sp.get("verified") === "true";
  const featured = sp.get("featured") === "true";

  return (
    <aside className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-[14px] font-black text-secondary">🔧 تصفية النتائج</h3>
        <button onClick={clearAll}
          className="text-[12px] text-primary font-semibold bg-none border-none cursor-pointer hover:underline">
          مسح الكل
        </button>
      </div>

      {/* Category */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">التصنيف</div>
        <div className="flex flex-col gap-1.5">
          {[{ slug: "", nameAr: "الكل", emoji: "⭐" }, ...STORE_CATEGORIES].map((c) => (
            <label key={c.slug} className="flex items-center justify-between py-1.5 px-2 rounded-[8px] hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={cat === c.slug || (c.slug === "" && !cat)}
                  onChange={() => update("category", c.slug || null)}
                  className="w-4 h-4 accent-primary cursor-pointer" />
                <span className="text-[13px] text-gray-700">{c.emoji} {c.nameAr}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">التقييم</div>
        {[5, 4, 3, 0].map((r) => (
          <label key={r} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <input type="radio" name="rating" checked={rating === (r ? r.toString() : "")}
              onChange={() => update("rating", r ? r.toString() : null)}
              className="accent-primary w-4 h-4" />
            <span className="flex gap-0.5 text-accent text-[12px]">
              {"★".repeat(r)}{"☆".repeat(5 - r)}
            </span>
            {r > 0 ? <span className="text-[12px] text-gray-500">فأكثر</span> : <span className="text-[12px] text-gray-500">الكل</span>}
          </label>
        ))}
      </div>

      {/* Country */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">الدولة</div>
        <div className="flex flex-col gap-1.5">
          {COUNTRIES.slice(0, 5).map((c) => (
            <label key={c.code} className="flex items-center gap-2 py-1 cursor-pointer">
              <input type="checkbox" checked={country === c.code}
                onChange={() => update("country", country === c.code ? null : c.code)}
                className="w-4 h-4 accent-primary cursor-pointer" />
              <span className="text-[13px] text-gray-700">{c.flag} {c.nameAr}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="px-5 py-4">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">الحالة</div>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="checkbox" checked={verified}
              onChange={() => update("verified", verified ? null : "true")}
              className="w-4 h-4 accent-primary cursor-pointer" />
            <span className="text-[13px] text-gray-700">✅ متاجر موثقة</span>
          </label>
          <label className="flex items-center gap-2 py-1 cursor-pointer">
            <input type="checkbox" checked={featured}
              onChange={() => update("featured", featured ? null : "true")}
              className="w-4 h-4 accent-primary cursor-pointer" />
            <span className="text-[13px] text-gray-700">⭐ متاجر مميزة</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
