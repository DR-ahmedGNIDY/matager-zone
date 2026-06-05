import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: number;
  color?: "primary" | "success" | "warning" | "danger";
  sub?: string;
}

export default function StatCard({ icon, label, value, change, color = "primary", sub }: StatCardProps) {
  const iconBg = {
    primary: "bg-primary-ultra text-primary",
    success: "bg-success-light text-green-700",
    warning: "bg-warning-light text-amber-700",
    danger:  "bg-danger-light text-red-700",
  }[color];

  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-11 h-11 rounded-[12px] flex items-center justify-center text-xl", iconBg)}>{icon}</div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full",
            change >= 0 ? "bg-success-light text-green-700" : "bg-danger-light text-red-700")}>
            {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-[28px] font-black text-secondary mb-0.5">{value}</div>
      <div className="text-[13px] text-gray-400">{label}</div>
      {sub && <div className="text-[12px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
