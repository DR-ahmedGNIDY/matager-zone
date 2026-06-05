"use client";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ── BarChart ──────────────────────────────────────────────────
interface BarChartProps {
  data: { name: string; value: number }[];
  title?: string;
  color?: string;
  valueLabel?: string;
}

export function BarChart({ data, title, color = "#4F6BFF", valueLabel = "طلبات" }: BarChartProps) {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-5">
      {title && <h3 className="text-[14px] font-black text-secondary mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={220}>
        <ReBarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,.1)", fontSize: 13 }}
            formatter={(val) => [`${val} ${valueLabel}`, ""]}
          />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── DonutChart ────────────────────────────────────────────────
interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  centerLabel?: string;
}

const COLORS = ["#4F6BFF","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899"];

export function DonutChart({ data, title, centerLabel }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-5">
      {title && <h3 className="text-[14px] font-black text-secondary mb-4">{title}</h3>}
      <div className="flex items-center gap-6">
        <div className="relative">
          <PieChart width={140} height={140}>
            <Pie data={data} innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
              {data.map((_, i) => <Cell key={i} fill={data[i].color || COLORS[i % COLORS.length]} />)}
            </Pie>
          </PieChart>
          {centerLabel && (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-secondary text-center pointer-events-none">
              {centerLabel}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color || COLORS[i % COLORS.length] }} />
                <span className="text-gray-600">{d.name}</span>
              </div>
              <span className="font-bold text-secondary">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ProductsTable ─────────────────────────────────────────────
interface ProductRow {
  id: string; name: string; priceInCents: number; totalOrders: number;
  stock?: number | null; status: string;
  images?: { url: string }[];
}

export function ProductsTable({ products, onEdit, onToggleStatus }: {
  products: ProductRow[];
  onEdit?: (id: string) => void;
  onToggleStatus?: (id: string, status: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-100">
            {["المنتج","السعر","المخزون","الطلبات","الحالة","إجراءات"].map((h) => (
              <th key={h} className="text-right text-[11px] font-bold text-gray-400 py-3 px-4 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gray-100 rounded-[8px] flex items-center justify-center text-sm overflow-hidden">
                    {p.images?.[0] ? <img src={p.images[0].url} className="w-full h-full object-contain" alt="" /> : "📦"}
                  </div>
                  <span className="font-semibold text-secondary max-w-[180px] truncate">{p.name}</span>
                </div>
              </td>
              <td className="py-3.5 px-4 font-bold text-secondary">
                {(p.priceInCents / 100).toLocaleString("ar-EG")} ج.م
              </td>
              <td className="py-3.5 px-4">
                {p.stock !== undefined && p.stock !== null
                  ? <span className={p.stock < 5 ? "text-danger font-bold" : "text-secondary"}>{p.stock}</span>
                  : <span className="text-gray-400">—</span>}
              </td>
              <td className="py-3.5 px-4 text-gray-500">{p.totalOrders}</td>
              <td className="py-3.5 px-4">
                <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  p.status === "ACTIVE" ? "bg-success-light text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {p.status === "ACTIVE" ? "نشط" : "مخفي"}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <div className="flex gap-1.5">
                  {onEdit && <button onClick={() => onEdit(p.id)} className="text-[11px] text-primary hover:underline border-none bg-none cursor-pointer">تعديل</button>}
                  {onToggleStatus && (
                    <button onClick={() => onToggleStatus(p.id, p.status === "ACTIVE" ? "HIDDEN" : "ACTIVE")}
                      className="text-[11px] text-gray-500 hover:text-danger border-none bg-none cursor-pointer">
                      {p.status === "ACTIVE" ? "إخفاء" : "نشر"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
