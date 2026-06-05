"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { STORE_CATEGORIES } from "@/lib/constants";
import { Search } from "lucide-react";

export default function StoreSearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = useState(sp.get("search") || "");
  const [category, setCategory] = useState(sp.get("category") || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category)       params.set("category", category);
    startTransition(() => router.push(`/stores?${params.toString()}`));
  };

  return (
    <div
      className="flex gap-0 bg-white border border-gray-200 rounded-[16px] overflow-hidden shadow-md max-w-[700px]"
      style={{ direction: "rtl" }}
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit(e as unknown as React.FormEvent)}
        placeholder="ابحث باسم المتجر أو المنتج..."
        className="flex-1 px-5 py-3.5 text-[15px] text-secondary outline-none border-none bg-transparent placeholder:text-gray-400"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="px-4 py-3.5 text-[13px] text-gray-600 border-r border-l border-gray-100 outline-none bg-white cursor-pointer min-w-[140px] font-medium"
      >
        <option value="">كل التصنيفات</option>
        {STORE_CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>{c.emoji} {c.nameAr}</option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white text-[14px] font-bold transition-all border-none cursor-pointer"
      >
        🔍 بحث
      </button>
    </div>
  );
}
