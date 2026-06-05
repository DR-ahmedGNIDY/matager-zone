import StatCard from "@/components/dashboard/StatCard";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

const AUDIT_ICONS: Record<string, string> = {
  STORE_APPROVED: "✅", STORE_REJECTED: "❌", STORE_SUSPENDED: "🚫",
  STORE_REACTIVATED: "🔄", USER_SUSPENDED: "🚫", USER_ACTIVATED: "✅",
  CATEGORY_CREATED: "🏷️", REVIEW_APPROVED: "⭐", REVIEW_DELETED: "🗑️",
  SETTINGS_UPDATED: "⚙️", USER_REGISTERED: "👤", STORE_CREATED: "🏪",
  PASSWORD_RESET_COMPLETED: "🔒", PASSWORD_CHANGED: "🔒",
};

interface Props {
  stats: {
    totalUsers: number; totalStores: number; activeStores: number;
    pendingStores: number; totalProducts: number; newStoresThisWeek: number;
  };
  recentActivity: Array<{
    id: string; action: string; entity: string;
    createdAt: Date | string;
    user: { name: string | null; email: string } | null;
    metadata?: unknown;
  }>;
  newStores: Array<{
    id: string; name: string; slug: string; status: string;
    createdAt: Date | string;
    owner: { name: string | null; email: string };
  }>;
}

export default function AdminOverview({ stats, recentActivity, newStores }: Props) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon="👥" label="المستخدمون"         value={stats.totalUsers.toLocaleString("ar-EG")}    color="primary" />
        <StatCard icon="🏪" label="المتاجر النشطة"     value={stats.activeStores.toLocaleString("ar-EG")}  color="success" />
        <StatCard icon="⏳" label="قيد المراجعة"       value={stats.pendingStores}                          color="danger"  />
        <StatCard icon="📦" label="المنتجات"           value={stats.totalProducts.toLocaleString("ar-EG")} color="warning" />
        <StatCard icon="🆕" label="متاجر هذا الأسبوع" value={stats.newStoresThisWeek}                      color="primary" />
        <StatCard icon="🏪" label="إجمالي المتاجر"    value={stats.totalStores.toLocaleString("ar-EG")}   color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending stores quick view */}
        <div className="bg-white/5 rounded-[20px] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-black text-white">⏳ أحدث الطلبات المعلقة</h3>
            <a href="/dashboard/admin?tab=pending"
              className="text-[12px] text-primary hover:text-primary-light no-underline">عرض الكل</a>
          </div>
          <div className="flex flex-col gap-2.5">
            {newStores.filter((s) => s.status === "PENDING").slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-white truncate">{s.name}</div>
                  <div className="text-[11px] text-gray-500">{s.owner.name || s.owner.email}</div>
                </div>
                <div className="text-[11px] text-gray-500 whitespace-nowrap flex-shrink-0">
                  {formatRelativeTime(s.createdAt)}
                </div>
              </div>
            ))}
            {newStores.filter((s) => s.status === "PENDING").length === 0 && (
              <p className="text-gray-500 text-[13px]">لا توجد طلبات معلقة</p>
            )}
          </div>
        </div>

        {/* Recent audit log */}
        <div className="bg-white/5 rounded-[20px] border border-white/10 p-5">
          <h3 className="text-[14px] font-black text-white mb-4">📋 آخر الإجراءات</h3>
          <div className="flex flex-col gap-2.5">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0 mt-0.5">{AUDIT_ICONS[log.action] ?? "🔧"}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-gray-300">
                    <span className="font-semibold text-white">{log.user?.name || "النظام"}</span>
                    {" — "}{log.action.replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-gray-600">{formatRelativeTime(log.createdAt)}</div>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="text-gray-500 text-[13px]">لا توجد إجراءات بعد</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
