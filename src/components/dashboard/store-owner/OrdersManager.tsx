"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice, formatRelativeTime, buildWhatsAppUrl } from "@/lib/utils";
import { updateOrderStatusAction } from "@/actions/store.actions";
import { EmptyState } from "@/components/common/EmptyState";
import type { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  NEW:       { label: "جديد",      color: "bg-primary-ultra text-primary border border-primary/20",  emoji: "🆕" },
  VIEWED:    { label: "مُشاهد",    color: "bg-gray-100 text-gray-600",        emoji: "👁️" },
  CONTACTED: { label: "تم التواصل",color: "bg-warning-light text-amber-700",  emoji: "💬" },
  CONFIRMED: { label: "مؤكد",      color: "bg-success-light text-green-700",  emoji: "✅" },
  COMPLETED: { label: "مكتمل",     color: "bg-success-light text-green-700",  emoji: "🎉" },
  CANCELLED: { label: "ملغى",      color: "bg-danger-light text-red-700",     emoji: "❌" },
};

const NEXT_STATUS: Record<string, OrderStatus> = {
  NEW:       "VIEWED",
  VIEWED:    "CONTACTED",
  CONTACTED: "CONFIRMED",
  CONFIRMED: "COMPLETED",
};

interface OrderItem {
  id: string; productName: string; quantity: number;
  priceInCents: number; selectedVariants: unknown;
}
interface Order {
  id: string; orderNumber: string; status: string;
  totalAmountInCents: number; itemCount: number;
  whatsappMessage: string; notes: string | null;
  createdAt: Date | string; updatedAt: Date | string;
  customer: { id: string; name: string | null; email: string } | null;
  items: OrderItem[];
}

interface Props {
  orders: Order[];
  total: number;
  page: number;
  storeWaNumber: string;
}

export default function OrdersManager({ orders: initial, total, page, storeWaNumber }: Props) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [orders, setOrders]   = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, startTransition]   = useTransition();

  const filterStatus = (status: string | null) => {
    const params = new URLSearchParams(sp.toString());
    if (status) params.set("status", status); else params.delete("status");
    params.delete("page");
    router.push(`/dashboard/store-owner/orders?${params.toString()}`);
  };

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result.success) {
        setOrders((prev) => prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
      }
    });
  };

  const handleWaReply = (order: Order) => {
    const url = buildWhatsAppUrl(
      storeWaNumber,
      `بخصوص طلبك رقم ${order.orderNumber}، `
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const currentStatus = sp.get("status");

  return (
    <div>
      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 flex-wrap">
        {[null, "NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => {
          const cfg = s ? STATUS_CONFIG[s] : null;
          return (
            <button key={s ?? "all"}
              onClick={() => filterStatus(s)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap border-none cursor-pointer transition-all ${
                currentStatus === s || (!s && !currentStatus)
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
              }`}>
              {cfg?.emoji} {cfg?.label ?? "الكل"} {!s && total > 0 && `(${total})`}
            </button>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="🛒" title="لا توجد طلبات" description="الطلبات القادمة عبر واتساب ستظهر هنا" />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const cfg  = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.NEW;
            const next = NEXT_STATUS[order.status];
            const isExp = expanded === order.id;
            return (
              <div key={order.id} className="bg-white rounded-[20px] border border-gray-100 overflow-hidden">
                {/* Header row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 flex-wrap"
                  onClick={() => setExpanded(isExp ? null : order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-black text-secondary">{order.orderNumber}</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
                        {cfg.emoji} {cfg.label}
                      </span>
                    </div>
                    <div className="text-[12px] text-gray-400 mt-0.5">
                      {order.customer?.name || "عميل غير مسجل"}
                      {" · "}
                      {order.itemCount} منتجات
                      {" · "}
                      {formatRelativeTime(order.createdAt)}
                    </div>
                  </div>
                  <div className="font-black text-secondary text-[15px]">
                    {formatPrice(order.totalAmountInCents)}
                  </div>
                  <span className="text-gray-400 text-sm">{isExp ? "▲" : "▼"}</span>
                </div>

                {/* Expanded detail */}
                {isExp && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    {/* Order items */}
                    <div className="mb-4">
                      <div className="text-[12px] font-bold text-gray-400 mb-2">المنتجات:</div>
                      <div className="flex flex-col gap-1.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-[13px]">
                            <span className="text-secondary">{item.productName} × {item.quantity}</span>
                            <span className="font-bold text-secondary">{formatPrice(item.priceInCents * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5 flex-wrap">
                      <button
                        onClick={() => handleWaReply(order)}
                        className="flex items-center gap-1.5 bg-wa hover:bg-wa-dark text-white px-4 py-2 rounded-[10px] text-[13px] font-bold border-none cursor-pointer transition-all"
                      >
                        💬 الرد على العميل
                      </button>
                      {next && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, next)}
                          className="flex items-center gap-1.5 bg-primary-ultra hover:bg-primary hover:text-white text-primary px-4 py-2 rounded-[10px] text-[13px] font-bold border-none cursor-pointer transition-all"
                        >
                          {STATUS_CONFIG[next]?.emoji} تحديث إلى: {STATUS_CONFIG[next]?.label}
                        </button>
                      )}
                      {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                          className="text-[13px] text-danger hover:underline border-none bg-none cursor-pointer"
                        >
                          إلغاء الطلب
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
