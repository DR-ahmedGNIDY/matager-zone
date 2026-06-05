"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/actions/product.actions";
import { toEGP, toPiastres } from "@/lib/utils";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  categories: { id: string; name: string; nameAr: string | null; emoji: string | null }[];
  initialData?: {
    name?: string; description?: string; priceInCents?: number;
    comparePriceInCents?: number | null; sku?: string; stock?: number | null;
    trackStock?: boolean; categoryId?: string | null; tags?: string[];
    status?: string; isFeatured?: boolean;
    images?: { url: string }[];
  };
}

export default function ProductForm({ mode, productId, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [name,        setName]        = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price,       setPrice]       = useState(initialData?.priceInCents ? toEGP(initialData.priceInCents) : 0);
  const [comparePrice,setComparePrice]= useState(initialData?.comparePriceInCents ? toEGP(initialData.comparePriceInCents) : 0);
  const [sku,         setSku]         = useState(initialData?.sku ?? "");
  const [stock,       setStock]       = useState<number | "">(initialData?.stock ?? "");
  const [trackStock,  setTrackStock]  = useState(initialData?.trackStock ?? false);
  const [categoryId,  setCategoryId]  = useState(initialData?.categoryId ?? "");
  const [tagsInput,   setTagsInput]   = useState(initialData?.tags?.join(", ") ?? "");
  const [status,      setStatus]      = useState<"ACTIVE"|"HIDDEN">(
    (initialData?.status as "ACTIVE"|"HIDDEN") ?? "ACTIVE"
  );
  const [isFeatured,  setIsFeatured]  = useState(initialData?.isFeatured ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("اسم المنتج مطلوب"); return; }
    if (!price || price <= 0) { setError("يرجى إدخال سعر صحيح"); return; }
    setError("");

    const payload = {
      name, description, price,
      comparePrice: comparePrice > 0 ? comparePrice : null,
      sku: sku || undefined,
      stock: trackStock ? (stock === "" ? null : Number(stock)) : null,
      trackStock,
      categoryId: categoryId || null,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      variants: [],
      status,
      isFeatured,
      imageUrls: [],
      imagePublicIds: [],
    };

    startTransition(async () => {
      const result = mode === "create"
        ? await createProductAction(payload)
        : await updateProductAction(productId!, payload);

      if (!result.success) { setError(result.error ?? "حدث خطأ"); return; }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/store-owner/products"), 800);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      {/* Name */}
      <div>
        <label className="form-label">اسم المنتج *</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="form-input" placeholder="مثال: ساعة ذكية Galaxy Watch" />
      </div>

      {/* Description */}
      <div>
        <label className="form-label">الوصف</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          className="form-input" rows={4} placeholder="وصف تفصيلي للمنتج..." />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">السعر (ج.م) *</label>
          <input type="number" min={0} step={0.01} value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="form-input" placeholder="0.00" />
        </div>
        <div>
          <label className="form-label">سعر المقارنة (ج.م)</label>
          <input type="number" min={0} step={0.01} value={comparePrice || ""}
            onChange={(e) => setComparePrice(Number(e.target.value))}
            className="form-input" placeholder="السعر قبل التخفيض" />
        </div>
      </div>

      {/* Category + SKU */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">التصنيف</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="form-input">
            <option value="">بدون تصنيف</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.nameAr || c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">رقم SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)}
            className="form-input" placeholder="SKU-001" dir="ltr" />
        </div>
      </div>

      {/* Stock */}
      <div className="bg-gray-50 rounded-[12px] p-4">
        <label className="flex items-center gap-2.5 cursor-pointer mb-3">
          <input type="checkbox" checked={trackStock}
            onChange={(e) => setTrackStock(e.target.checked)}
            className="w-4 h-4 accent-primary" />
          <span className="text-[14px] font-semibold text-secondary">تتبع المخزون</span>
        </label>
        {trackStock && (
          <div>
            <label className="form-label">الكمية المتاحة</label>
            <input type="number" min={0} value={stock}
              onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
              className="form-input w-32" placeholder="0" />
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="form-label">الوسوم (مفصولة بفاصلة)</label>
        <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
          className="form-input" placeholder="إلكترونيات, ساعات, هدايا" />
      </div>

      {/* Status + Featured */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">الحالة</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "ACTIVE"|"HIDDEN")} className="form-input">
            <option value="ACTIVE">نشط</option>
            <option value="HIDDEN">مخفي</option>
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-primary" />
            <span className="text-[14px] font-semibold text-secondary">منتج مميز</span>
          </label>
        </div>
      </div>

      {error   && <p className="text-danger text-[13px] bg-danger-light rounded-[10px] px-4 py-2">{error}</p>}
      {success && <p className="text-success text-[13px] bg-success-light rounded-[10px] px-4 py-2">✅ تم الحفظ بنجاح، جاري التحويل...</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={isPending || success} className="btn btn-primary disabled:opacity-60">
          {isPending ? "جاري الحفظ..." : mode === "create" ? "إضافة المنتج" : "حفظ التعديلات"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn btn-outline">إلغاء</button>
      </div>
    </form>
  );
}
