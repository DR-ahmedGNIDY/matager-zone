"use client";
import { cn } from "@/lib/utils";

// ── VariantSelector ────────────────────────────────────────────
interface Variant { name: string; options: string[]; }
interface VariantSelectorProps {
  variants: Variant[];
  selected: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function VariantSelector({ variants, selected, onChange }: VariantSelectorProps) {
  if (!variants.length) return null;
  return (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <div key={variant.name}>
          <div className="text-[13px] font-bold text-secondary mb-2">
            {variant.name}: <span className="text-primary font-bold">{selected[variant.name] || "—"}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {variant.options.map((opt) => {
              const isColor = variant.name.toLowerCase().includes("لون") || variant.name.toLowerCase().includes("color");
              const isSelected = selected[variant.name] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => onChange(variant.name, opt)}
                  className={cn(
                    "px-3.5 py-2 rounded-[8px] text-[13px] font-semibold border-2 transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary-ultra text-primary"
                      : "border-gray-200 bg-white text-gray-700 hover:border-primary"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── QuantityControl ────────────────────────────────────────────
interface QuantityControlProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export function QuantityControl({ value, onChange, min = 1, max = 99 }: QuantityControlProps) {
  return (
    <div className="flex items-center gap-0 border border-gray-200 rounded-[10px] overflow-hidden w-fit">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all text-lg font-bold border-none cursor-pointer bg-white"
      >-</button>
      <span className="w-10 h-10 flex items-center justify-center text-[15px] font-black text-secondary border-x border-gray-200">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all text-lg font-bold border-none cursor-pointer bg-white"
      >+</button>
    </div>
  );
}
