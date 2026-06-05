"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatRelativeTime, buildWhatsAppUrl } from "@/lib/utils";
import { approveStoreAction, rejectStoreAction, suspendStoreAction, reactivateStoreAction } from "@/actions/admin.actions";
import { buildStoreAdminWaUrl } from "@/services/admin.service";
import { STORE_STATUS_CONFIG } from "@/lib/constants";
import { EmptyState } from "@/components/common/EmptyState";
import type { StoreStatus } from "@/types";

interface StoreRow {
  id: string; name: string; slug: string; status: StoreStatus;
  isVerified: boolean; createdAt: Date | string;
  owner: { id: string; name: string | null; email: string; phone: string | null };
  category: { nameAr: string; emoji: string } | null;
  _count: { products: number; orders: number; followers: number };
  rejectionReason?: string | null;
  suspendReason?:   string | null;
}

interface Props {
  stores: StoreRow[];
  mode:   "pending" | "all";
  total?: number;
  page?:  number;
}

export default function AdminStoresTab({ stores: initial, mode, total = 0, page = 1 }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [stores, setStores] = useState(initial);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [suspendModal, setSuspendModal] = useState<{ id: string; name: string } | null>(null);
  const [modalReason, setModalReason] = useState("");
  const [, startTransition] = useTransition();

  const updateSearch = (key: string, val: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/dashboard/admin?tab=stores&${p.toString()}`);
  };

  const remove = (id: string) => setStores((prev) => prev.filter((s) => s.id !== id));
  const updateStatus = (id: string, status: StoreStatus) =>
    setStores((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const r = await approveStoreAction(id);
      if (r.success) { mode === "pending" ? remove(id) : updateStatus(id, "ACTIVE"); }
    });
  };

  const handleReject = () => {
    if (!rejectModal || !modalReason.trim()) return;
    const { id } = rejectModal;
    startTransition(async () => {
      const r = await rejectStoreAction(id, modalReason);
      if (r.success) { mode === "pending" ? remove(id) : updateStatus(id, "REJECTED"); }
      setRejectModal(null); setModalReason("");
    });
  };

  const handleSuspend = () => {
    if (!suspendModal) return;
    const { id } = suspendModal;
    startTransition(async () => {
      const r = await suspendStoreAction(id, modalReason || "مخالفة سياسة المنصة");
      if (r.success) updateStatus(id, "SUSPENDED");
      setSuspendModal(null); setModalReason("");
    });
  };

  const handleReactivate = (id: string) => {
    startTransition(async () => {
      const r = await reactivateStoreAction(id);
      if (r.success) updateStatus(id, "ACTIVE");
    });
  };

  return (
    <div>
      {/* Filters (all mode only) */}
      {mode === "all" && (
        <div className="flex gap-3 mb-5 flex-wrap">
          <input
            type="text"
            defaultValue={sp.get("search") || ""}
            placeholder="ابحث عن متجر..."
            className="bg-white/10 border border-white/15 text-white rounded-[10px] px-4 py-2 text-[13px] outline-none placeholder:text-gray-500 min-w-[200px]"
            onKeyDown={(e) => { if (e.key === "Enter") updateSearch("search", (e.target as HTMLInputElement).value || null); }}
          />
          <select
            defaultValue={sp.get("status") || ""}
            onChange={(e) => updateSearch("status", e.target.value || null)}
            className="bg-white/10 border border-white/15 text-white rounded-[10px] px-4 py-2 text-[13px] outline-none cursor-pointer"
          >
            <option value="">كل الحالات</option>
            {["PENDING","ACTIVE","REJECTED","SUSPENDED"].map((s) => (
              <option key={s} value={s}>{STORE_STATUS_CONFIG[s as StoreStatus]?.label}</option>
            ))}
          </select>
        </div>
      )}

      {stores.length === 0 ? (
        <EmptyState icon="🏪" title={mode === "pending" ? "لا توجد طلبات معلقة 🎉" : "لا توجد متاجر"} />
      ) : (
        <div className="bg-white/5 rounded-[20px] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/10">
                  {["المتجر","صاحب المتجر","التصنيف","الحالة","المنتجات","الطلبات","التاريخ","إجراءات"].map((h) => (
                    <th key={h} className="text-right text-[11px] font-bold text-gray-500 py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => {
                  const cfg = STORE_STATUS_CONFIG[store.status];
                  const ownerWa = store.owner.phone
                    ? store.owner.phone.replace(/[^0-9]/g, "")
                    : null;

                  return (
                    <tr key={store.id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                      <td className="py-3 px-4">
                        <a href={`/store/${store.slug}`} target="_blank"
                          className="font-bold text-white hover:text-primary no-underline">{store.name}</a>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-300 text-[12px]">{store.owner.name || "—"}</div>
                        <div className="text-gray-500 text-[11px]">{store.owner.email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[12px]">
                        {store.category ? `${store.category.emoji} ${store.category.nameAr}` : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg?.color || ""}`}>
                          {cfg?.emoji} {cfg?.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{store._count.products}</td>
                      <td className="py-3 px-4 text-gray-400">{store._count.orders}</td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap text-[11px]">
                        {formatRelativeTime(store.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* WhatsApp contact — always available */}
                          {ownerWa && (
                            <a href={buildStoreAdminWaUrl(ownerWa, store.name, store.owner.name || "")}
                              target="_blank" rel="noopener noreferrer"
                              className="text-[11px] bg-wa/20 text-green-400 hover:bg-wa/40 px-2 py-1 rounded-[6px] no-underline transition-all">
                              💬 واتساب
                            </a>
                          )}
                          {/* Status-based actions */}
                          {store.status === "PENDING" && (
                            <>
                              <button onClick={() => handleApprove(store.id)}
                                className="text-[11px] bg-success/20 text-green-400 hover:bg-success/30 px-2 py-1 rounded-[6px] border-none cursor-pointer">
                                ✅ قبول
                              </button>
                              <button onClick={() => { setRejectModal({ id: store.id, name: store.name }); setModalReason(""); }}
                                className="text-[11px] bg-danger/20 text-red-400 hover:bg-danger/30 px-2 py-1 rounded-[6px] border-none cursor-pointer">
                                ❌ رفض
                              </button>
                            </>
                          )}
                          {store.status === "ACTIVE" && (
                            <button onClick={() => { setSuspendModal({ id: store.id, name: store.name }); setModalReason(""); }}
                              className="text-[11px] bg-warning/20 text-amber-400 hover:bg-warning/30 px-2 py-1 rounded-[6px] border-none cursor-pointer">
                              🚫 إيقاف
                            </button>
                          )}
                          {store.status === "SUSPENDED" && (
                            <button onClick={() => handleReactivate(store.id)}
                              className="text-[11px] bg-primary/20 text-primary hover:bg-primary/30 px-2 py-1 rounded-[6px] border-none cursor-pointer">
                              🔄 إعادة تفعيل
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {mode === "all" && total > 20 && (
            <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between text-[12px] text-gray-500">
              <span>إجمالي: {total} متجر</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <a href={`/dashboard/admin?tab=stores&page=${page - 1}`}
                    className="text-primary hover:underline no-underline">السابق</a>
                )}
                <span>صفحة {page}</span>
                {page * 20 < total && (
                  <a href={`/dashboard/admin?tab=stores&page=${page + 1}`}
                    className="text-primary hover:underline no-underline">التالي</a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <Modal title={`رفض متجر: ${rejectModal.name}`} onClose={() => setRejectModal(null)}>
          <p className="text-gray-400 text-[13px] mb-3">يرجى كتابة سبب الرفض ليصل للتاجر.</p>
          <textarea value={modalReason} onChange={(e) => setModalReason(e.target.value)}
            className="w-full bg-white/10 border border-white/15 text-white rounded-[10px] px-4 py-3 text-[13px] outline-none resize-none"
            rows={3} placeholder="سبب الرفض..." />
          <div className="flex gap-2 mt-4">
            <button onClick={handleReject} disabled={!modalReason.trim()}
              className="btn btn-primary flex-1 disabled:opacity-50">تأكيد الرفض</button>
            <button onClick={() => setRejectModal(null)} className="btn btn-outline">إلغاء</button>
          </div>
        </Modal>
      )}

      {/* Suspend modal */}
      {suspendModal && (
        <Modal title={`إيقاف متجر: ${suspendModal.name}`} onClose={() => setSuspendModal(null)}>
          <p className="text-gray-400 text-[13px] mb-3">سبب الإيقاف (اختياري)</p>
          <textarea value={modalReason} onChange={(e) => setModalReason(e.target.value)}
            className="w-full bg-white/10 border border-white/15 text-white rounded-[10px] px-4 py-3 text-[13px] outline-none resize-none"
            rows={2} placeholder="مخالفة سياسة المنصة..." />
          <div className="flex gap-2 mt-4">
            <button onClick={handleSuspend}
              className="btn btn-primary flex-1">تأكيد الإيقاف</button>
            <button onClick={() => setSuspendModal(null)} className="btn btn-outline">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[9000] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1E293B] border border-white/15 rounded-[20px] w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-[15px] font-black text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl border-none bg-none cursor-pointer">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
