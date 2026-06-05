"use client";
import { useState, useTransition } from "react";
import { createCategoryAction, updateCategoryAction } from "@/actions/admin.actions";

interface Category {
  id: string; name: string; nameAr: string; emoji: string;
  slug: string; isActive: boolean; sortOrder: number;
  _count: { stores: number };
}

interface Props { categories: Category[] }

export default function AdminCategoriesTab({ categories: initial }: Props) {
  const [categories, setCategories] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", nameAr: "", emoji: "", slug: "", description: "" });
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const handleCreate = () => {
    if (!form.nameAr.trim() || !form.emoji.trim() || !form.slug.trim()) {
      setError("الاسم والإيموجي والرابط مطلوبة");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await createCategoryAction({
        name:        form.name || form.nameAr,
        nameAr:      form.nameAr,
        emoji:       form.emoji,
        slug:        form.slug,
        description: form.description || undefined,
      });
      if (!result.success) { setError(result.error ?? "حدث خطأ"); return; }
      setCategories((prev) => [...prev, {
        id: result.id!, name: form.name || form.nameAr,
        nameAr: form.nameAr, emoji: form.emoji,
        slug: form.slug, isActive: true, sortOrder: 0,
        _count: { stores: 0 },
      }]);
      setForm({ name: "", nameAr: "", emoji: "", slug: "", description: "" });
      setShowForm(false);
    });
  };

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await updateCategoryAction(id, { isActive: !current });
      if (result.success) {
        setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !current } : c));
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-black text-white">🏷️ تصنيفات المتاجر</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="btn btn-primary btn-sm">
          {showForm ? "إلغاء" : "➕ تصنيف جديد"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-[16px] p-5 mb-5">
          <h3 className="text-[14px] font-black text-white mb-4">إضافة تصنيف جديد</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-gray-400 mb-1 block">الاسم بالعربية *</label>
              <input value={form.nameAr} onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
                className="w-full bg-white/10 border border-white/15 text-white rounded-[10px] px-3 py-2 text-[13px] outline-none"
                placeholder="إلكترونيات" />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 mb-1 block">الإيموجي *</label>
              <input value={form.emoji} onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                className="w-full bg-white/10 border border-white/15 text-white rounded-[10px] px-3 py-2 text-[13px] outline-none"
                placeholder="📱" />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 mb-1 block">الرابط (slug) *</label>
              <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))}
                className="w-full bg-white/10 border border-white/15 text-white rounded-[10px] px-3 py-2 text-[13px] outline-none"
                placeholder="electronics" dir="ltr" />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 mb-1 block">الاسم بالإنجليزية</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-white/10 border border-white/15 text-white rounded-[10px] px-3 py-2 text-[13px] outline-none"
                placeholder="Electronics" dir="ltr" />
            </div>
          </div>
          {error && <p className="text-red-400 text-[12px] mb-3">{error}</p>}
          <button onClick={handleCreate} className="btn btn-primary">إضافة التصنيف</button>
        </div>
      )}

      {/* List */}
      <div className="bg-white/5 rounded-[20px] border border-white/10 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-white/10">
              {["التصنيف","الرابط","المتاجر","الحالة","إجراءات"].map((h) => (
                <th key={h} className="text-right text-[11px] font-bold text-gray-500 py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-white/5 hover:bg-white/3">
                <td className="py-3 px-4">
                  <span className="text-lg ml-2">{cat.emoji}</span>
                  <span className="font-bold text-white">{cat.nameAr}</span>
                </td>
                <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{cat.slug}</td>
                <td className="py-3 px-4 text-gray-400">{cat._count.stores}</td>
                <td className="py-3 px-4">
                  <span className={`text-[11px] font-bold ${cat.isActive ? "text-green-400" : "text-gray-500"}`}>
                    {cat.isActive ? "✓ نشط" : "✗ مخفي"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleActive(cat.id, cat.isActive)}
                    className="text-[11px] text-gray-400 hover:text-white border-none bg-none cursor-pointer"
                  >
                    {cat.isActive ? "إخفاء" : "تفعيل"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
