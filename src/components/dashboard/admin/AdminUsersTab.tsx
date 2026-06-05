"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";
import { toggleUserActiveAction } from "@/actions/admin.actions";
import { EmptyState } from "@/components/common/EmptyState";

interface UserRow {
  id: string; name: string | null; email: string;
  role: string; isActive: boolean; isOwner: boolean;
  createdAt: Date | string;
  _count: { stores: number; orders: number };
}

interface Props { users: UserRow[]; total: number; page: number; }

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ADMIN:       { label: "مدير",   color: "bg-primary text-white" },
  STORE_OWNER: { label: "تاجر",   color: "bg-success-light text-green-700" },
  CUSTOMER:    { label: "عميل",   color: "bg-gray-700 text-gray-300" },
};

export default function AdminUsersTab({ users: initial, total, page }: Props) {
  const router = useRouter();
  const sp     = useSearchParams();
  const [users, setUsers] = useState(initial);
  const [, startTransition] = useTransition();

  const updateSearch = (val: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set("search", val); else p.delete("search");
    p.delete("page");
    router.push(`/dashboard/admin?tab=users&${p.toString()}`);
  };

  const handleToggle = (userId: string) => {
    startTransition(async () => {
      const result = await toggleUserActiveAction(userId);
      if (result.success) {
        setUsers((prev) => prev.map((u) =>
          u.id === userId ? { ...u, isActive: result.isActive! } : u
        ));
      }
    });
  };

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          defaultValue={sp.get("search") || ""}
          placeholder="ابحث بالاسم أو البريد..."
          className="bg-white/10 border border-white/15 text-white rounded-[10px] px-4 py-2 text-[13px] outline-none placeholder:text-gray-500 flex-1 max-w-xs"
          onKeyDown={(e) => { if (e.key === "Enter") updateSearch((e.target as HTMLInputElement).value || null); }}
        />
      </div>

      {users.length === 0 ? (
        <EmptyState icon="👥" title="لا يوجد مستخدمون" />
      ) : (
        <div className="bg-white/5 rounded-[20px] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/10">
                  {["المستخدم","البريد","الدور","المتاجر","الطلبات","الحالة","الانضمام","إجراءات"].map((h) => (
                    <th key={h} className="text-right text-[11px] font-bold text-gray-500 py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const role = ROLE_LABELS[u.role] ?? ROLE_LABELS.CUSTOMER;
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                      <td className="py-3 px-4 font-semibold text-white">{u.name || "—"}</td>
                      <td className="py-3 px-4 text-gray-400 text-[12px]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${role.color}`}>
                          {role.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{u._count.stores}</td>
                      <td className="py-3 px-4 text-gray-400">{u._count.orders}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-bold ${u.isActive ? "text-green-400" : "text-red-400"}`}>
                          {u.isActive ? "✓ نشط" : "✗ موقوف"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                        {formatRelativeTime(u.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => handleToggle(u.id)}
                            className={`text-[11px] px-2.5 py-1 rounded-[6px] border-none cursor-pointer transition-all ${
                              u.isActive
                                ? "bg-danger/20 text-red-400 hover:bg-danger/30"
                                : "bg-success/20 text-green-400 hover:bg-success/30"
                            }`}
                          >
                            {u.isActive ? "إيقاف" : "تفعيل"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > 20 && (
            <div className="px-5 py-3 border-t border-white/10 flex justify-between text-[12px] text-gray-500">
              <span>إجمالي: {total} مستخدم</span>
              <div className="flex gap-3">
                {page > 1 && <a href={`/dashboard/admin?tab=users&page=${page-1}`} className="text-primary no-underline">السابق</a>}
                <span>صفحة {page}</span>
                {page * 20 < total && <a href={`/dashboard/admin?tab=users&page=${page+1}`} className="text-primary no-underline">التالي</a>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
