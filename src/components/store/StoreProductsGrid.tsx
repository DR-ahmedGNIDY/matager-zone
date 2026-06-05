"use client";
import { useState } from "react";
import ProductCard from "@/components/common/ProductCard";
import { EmptyState } from "@/components/common/EmptyState";

interface Category { id: string; name: string; nameAr?: string | null; emoji?: string | null; }
interface Product {
  id: string; name: string; priceInCents: number; comparePriceInCents?: number | null;
  images?: { url: string; alt?: string | null }[];
  store: { id: string; name: string; slug: string; whatsappNumber: string; countryCode?: string; };
}

interface StoreProductsGridProps {
  products: Product[];
  categories: Category[];
  storeSlug: string;
}

export default function StoreProductsGrid({ products, categories, storeSlug }: StoreProductsGridProps) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("");

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div id="products" className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-black text-secondary">🛍️ منتجات المتجر</h2>
          <p className="text-[13px] text-gray-400">{products.length} منتج متاح</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في منتجات المتجر..."
            className="w-full bg-gray-100 border border-transparent rounded-[10px] py-2.5 pr-9 pl-4 text-[13px] outline-none focus:border-primary focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCat("")}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border-none cursor-pointer ${!activeCat ? "bg-primary text-white shadow-primary" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border-none cursor-pointer ${activeCat === cat.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {cat.emoji} {cat.nameAr || cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon="📦" title="لا توجد منتجات مطابقة" description="جرب كلمة بحث أخرى" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
