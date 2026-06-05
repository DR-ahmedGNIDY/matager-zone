"use client";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

interface Order {
  id: string; orderNumber: string; status: OrderStatus;
  totalAmountInCents: number; itemCount: number; createdAt: Date | string;
  store?: { name: string; slug: string };
}

interface OrdersTableProps {
  orders: Order[];
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  showStore?: boolean;
  emptyMessage?: string;
}

const STATUS_OPTIONS: OrderStatus[] = ["NEW","VIEWED","CONTACTED","CONFIRMED","COMPLETED","CANCELLED"];

export default function OrdersTable({ orders, onStatusChange, showStore, emptyMessage }: OrdersTableProps) {
  if (!orders.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-[14px]">
        {emptyMessage || "لا توجد طلبات بعد."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-100">
            {["#الطلب","الحالة","المنتجات","الإجمالي","التاريخ", ...(showStore ? ["المتجر"] : []), ...(onStatusChange ? ["تغيير الحالة"] : [])].map((h) => (
              <th key={h} className="text-right text-[11px] font-bold text-gray-400 py-3 px-4 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];
            return (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                <td className="py-3.5 px-4 font-bold text-secondary">{order.orderNumber}</td>
                <td className="py-3.5 px-4">
                  <span className={cn("inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border", statusConfig.color)}>
                    {statusConfig.emoji} {statusConfig.label}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-500">{order.itemCount} منتجات</td>
                <td className="py-3.5 px-4 font-black text-secondary">{formatPrice(order.totalAmountInCents)}</td>
                <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">{formatRelativeTime(order.createdAt)}</td>
                {showStore && order.store && (
                  <td className="py-3.5 px-4">
                    <a href={`/store/${order.store.slug}`} className="text-primary hover:underline no-underline">{order.store.name}</a>
                  </td>
                )}
                {onStatusChange && (
                  <td className="py-3.5 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                      className="border border-gray-200 rounded-[8px] py-1 px-2 text-[12px] outline-none bg-white cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
