"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { toggleProductStatusAction, deleteProductAction } from "@/actions/product.actions";
import { EmptyState } from "@/components/common/EmptyState";
import type { ProductListItem } from "@/services/product.service";

interface Props {
  products:   ProductListItem[];
  categories: { id: string; name: string; nameAr: string | null; emoji: string | null }[];
  total:      number;
  storeId:    string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE:   { label: "نشط",    color: "bg-success-light text-green-700" },
  HIDDEN:   { label: "مخفي",   color: "bg-gray-100 text-gray-500" },
  ARCHIVED: { label: "محذوف",  color: "bg-danger-light text-red-700" },
};

export default function ProductsManager({ products: initial, categories, total }: Props) {
  const router      = useRouter();
  const sp          = useSearchParams();
  const [items, setItems]       = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [, startTransition]     = useTransition();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/dashboard/store-owner/products?${params.toString()}`);
  };

  const handleToggleStatus = (productId: string) => {
    startTransition(async () => {
      const result = await toggleProductStatusAction(productId);
      if (result.success && result.newStatus) {
        setItems((prev) => prev.map((p) =>
          p.id === productId ? { ...p, status: result.newStatus! } : p
        ));
      }
    });
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    setDeleting(productId);
    const result = await deleteProductAction(productId);
    if (result.success) {
      setItems((prev) => prev.filter((p) => p.id !== productId));
    }
    setDeleting(null);
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-[16px] border border-gray-100 p-4 mb-5 flex gap-3 flex-wrap items-center">
        <input
          type="text"
          defaultValue={sp.get("search") || ""}
          placeholder="ابحث عن منتج..."
          className="form-input flex-1 min-w-[180px]"
          onKeyDown={(e) => {
            if (e.key === "Enter") updateFilter("search", (e.target as HTMLInputElement).value || null);
          }}
        />
        <select
          defaultValue={sp.get("status") || ""}
          onChange={(e) => updateFilter("status", e.target.value || null)}
          className="form-input w-auto min-w-[130px]"
        >
          <option value="">كل الحالات</option>
          <option value="ACTIVE">نشط</option>
          <option value="HIDDEN">مخفي</option>
        </select>
        <select
          defaultValue={sp.get("category") || ""}
          onChange={(e) => updateFilter("category", e.target.value || null)}
          className="form-input w-auto min-w-[140px]"
        >
          <option value="">كل التصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.nameAr || c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <EmptyState
          icon="📦"
          title="لا توجد منتجات بعد"
          description="ابدأ بإضافة منتجاتك لمتجرك"
          action={{ label: "إضافة منتج", href: "/dashboard/store-owner/products/new" }}
        />
      ) : (
        <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["المنتج","السعر","المخزون","الطلبات","الحالة","إجراءات"].map((h) => (
                    <th key={h} className="text-right text-[11px] font-bold text-gray-400 py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const st = STATUS_LABELS[p.status] ?? STATUS_LABELS.HIDDEN;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 bg-gray-100 rounded-[8px] flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                            {p.images[0] ? <img src={p.images[0].url} className="w-full h-full object-contain p-0.5" alt="" /> : "📦"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-secondary truncate max-w-[200px]">{p.name}</div>
                            {p.category && <div className="text-[11px] text-gray-400">{p.category.nameAr || p.category.name}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-secondary whitespace-nowrap">
                        {formatPrice(p.priceInCents)}
                        {p.comparePriceInCents && (
                          <div className="text-[11px] text-gray-400 line-through">{formatPrice(p.comparePriceInCents)}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.trackStock
                          ? <span className={p.stock === 0 ? "text-danger font-bold" : "text-secondary"}>{p.stock ?? 0}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{p.totalOrders}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/store-owner/products/${p.id}/edit`}
                            className="text-[12px] text-primary hover:underline no-underline">تعديل</Link>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() => handleToggleStatus(p.id)}
                            className="text-[12px] text-gray-500 hover:text-primary border-none bg-none cursor-pointer"
                          >
                            {p.status === "ACTIVE" ? "إخفاء" : "نشر"}
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            className="text-[12px] text-danger hover:underline border-none bg-none cursor-pointer disabled:opacity-50"
                          >
                            {deleting === p.id ? "..." : "حذف"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-[12px] text-gray-400">
            إجمالي: {total} منتج
          </div>
        </div>
      )}
    </div>
  );
}
