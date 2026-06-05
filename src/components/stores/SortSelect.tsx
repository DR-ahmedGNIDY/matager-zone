"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface SortSelectProps {
  defaultValue?: string;
}

const SORT_OPTIONS = [
  { value: "popular", label: "الأكثر شعبية" },
  { value: "rating",  label: "الأعلى تقييماً" },
  { value: "newest",  label: "الأحدث" },
  { value: "products",label: "الأكثر منتجات" },
];

export default function SortSelect({ defaultValue = "popular" }: SortSelectProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(sp.toString());
    params.set("sort", e.target.value);
    params.delete("page");
    startTransition(() => router.push(`/stores?${params.toString()}`));
  };

  return (
    <select
      defaultValue={defaultValue}
      onChange={handleChange}
      className="px-3 py-2 border border-gray-200 rounded-[10px] text-[13px] text-secondary bg-white outline-none cursor-pointer"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
