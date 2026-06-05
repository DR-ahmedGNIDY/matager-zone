import { formatNumber } from "@/lib/utils";

interface StatsBarProps {
  stores: number;
  products: number;
  users: number;
}

const STATS = (stores: number, products: number, users: number) => [
  { icon: "📦", value: `+${formatNumber(1000000)}`, label: "جنيه مبيعات" },
  { icon: "👥", value: `+${formatNumber(users || 20000)}`, label: "عميل نشط" },
  { icon: "🛍️", value: `+${formatNumber(products || 50000)}`, label: "منتج متاح" },
  { icon: "🏪", value: `+${formatNumber(stores || 500)}`, label: "متجر نشط" },
];

export default function StatsBar({ stores, products, users }: StatsBarProps) {
  const stats = STATS(stores, products, users);

  return (
    <div className="bg-white border-b border-gray-100 py-7 px-6">
      <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-0">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex items-center gap-3.5 px-8 ${i > 0 ? "border-r border-gray-100" : ""} max-sm:px-4 max-sm:border-r-0 max-sm:border-b max-sm:border-gray-100 max-sm:pb-5 max-sm:mb-5 max-sm:last:border-b-0`}
          >
            <div className="w-12 h-12 bg-primary-ultra rounded-[12px] flex items-center justify-center text-xl flex-shrink-0">
              {stat.icon}
            </div>
            <div>
              <div className="text-[26px] font-black text-secondary leading-none">{stat.value}</div>
              <div className="text-[13px] text-gray-400 mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
