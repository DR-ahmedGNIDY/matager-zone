"use client";

// ── WizardProgress ─────────────────────────────────────────────
interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { label: string }[];
}

export function WizardProgress({ currentStep, totalSteps, steps }: WizardProgressProps) {
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const num = i + 1;
        const done   = num < currentStep;
        const active = num === currentStep;
        return (
          <div key={i} className="flex items-start flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-black border-2 transition-all ${
                done   ? "bg-success border-success text-white" :
                active ? "bg-primary border-primary text-white shadow-primary" :
                         "bg-white border-gray-200 text-gray-400"
              }`}>
                {done ? "✓" : num}
              </div>
              <span className={`text-[11px] font-bold whitespace-nowrap ${active ? "text-primary" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 mt-5 mx-1.5 transition-all ${done ? "bg-success" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── StorePreviewCard ───────────────────────────────────────────
interface StorePreviewCardProps {
  name?: string;
  description?: string;
  emoji?: string;
  categoryName?: string;
  primaryColor?: string;
}

export function StorePreviewCard({ name, description, emoji = "🏪", categoryName, primaryColor = "#4F6BFF" }: StorePreviewCardProps) {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden sticky top-[84px]">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h4 className="text-[13px] font-black text-secondary">👁️ معاينة مباشرة</h4>
      </div>
      <div className="p-4">
        {/* Cover */}
        <div
          className="h-[90px] rounded-[12px] flex items-center justify-center text-3xl opacity-60 mb-[-20px]"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)` }}
        >
          {emoji}
        </div>
        {/* Logo */}
        <div className="flex items-end gap-2.5 px-1 mb-2">
          <div className="w-12 h-12 bg-white rounded-[10px] border-2 border-white shadow flex items-center justify-center text-xl flex-shrink-0">
            {emoji}
          </div>
        </div>
        <div className="text-[15px] font-black text-secondary min-h-5">{name || "اسم متجرك"}</div>
        {categoryName && <div className="text-[12px] text-gray-400 mt-0.5">{emoji} {categoryName}</div>}
        <p className="text-[12px] text-gray-500 leading-relaxed mt-2 min-h-[36px] line-clamp-3">
          {description || "وصف متجرك سيظهر هنا..."}
        </p>
        <button
          className="w-full flex items-center justify-center gap-1.5 bg-wa text-white rounded-[10px] py-2.5 text-[12px] font-bold mt-3 border-none cursor-pointer"
        >
          💬 اطلب عبر واتساب
        </button>
      </div>
    </div>
  );
}
