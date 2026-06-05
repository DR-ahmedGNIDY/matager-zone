"use client";

import Link from "next/link";
import { useState } from "react";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <section className="py-[72px] px-6 bg-white" id="pricing">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3.5">💎 الباقات</div>
          <h2 className="text-[clamp(22px,3vw,34px)] font-black text-secondary mb-2.5">باقات تناسب احتياجاتك</h2>
          <p className="text-[15px] text-gray-500">اختر الباقة المناسبة لبدء رحلتك وتنمية متجرك</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-[14px] font-semibold text-gray-500">شهري</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-[52px] h-[28px] bg-primary rounded-full relative cursor-pointer border-none transition-all"
          >
            <div className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm ${isYearly ? "left-[3px]" : "right-[3px]"}`} />
          </button>
          <span className="text-[14px] font-semibold text-gray-500">
            سنوي{" "}
            <span className="bg-success-light text-green-700 text-[11px] px-2 py-0.5 rounded-full">وفّر 20%</span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[900px] mx-auto">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPriceInCents : plan.monthlyPriceInCents;
            const isFeatured = plan.id === "PROFESSIONAL";

            return (
              <div
                key={plan.id}
                className={`rounded-[32px] p-8 relative transition-all ${
                  isFeatured
                    ? "bg-primary text-white shadow-primary scale-[1.04]"
                    : "bg-white border border-gray-100 hover:-translate-y-1 hover:shadow-md"
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-black px-4 py-1 rounded-full whitespace-nowrap">
                    الأكثر شعبية 🔥
                  </div>
                )}
                <div className={`text-[18px] font-black mb-1.5 ${isFeatured ? "text-white" : "text-secondary"}`}>
                  {plan.nameAr}
                </div>
                <div className={`text-[13px] mb-6 ${isFeatured ? "text-white/70" : "text-gray-400"}`}>
                  {plan.description}
                </div>

                <div className="flex items-end gap-1.5 mb-1.5">
                  <span className={`text-[16px] font-bold pb-1.5 ${isFeatured ? "text-white/80" : "text-gray-500"}`}>ج.م</span>
                  <span className={`text-[42px] font-black leading-none ${isFeatured ? "text-white" : "text-secondary"}`}>
                    {(price / 100).toLocaleString("ar-EG")}
                  </span>
                  <span className={`text-[13px] pb-1.5 ${isFeatured ? "text-white/60" : "text-gray-400"}`}>/ شهرياً</span>
                </div>

                <div className={`h-px my-6 ${isFeatured ? "bg-white/20" : "bg-gray-100"}`} />

                <ul className="flex flex-col gap-2.5 mb-7 list-none m-0 p-0">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-[13px] list-none ${isFeatured ? "text-white/90" : "text-gray-700"}`}>
                      <span className={isFeatured ? "text-[#A7F3D0]" : "text-success"}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/dashboard/store-owner/create"
                  className={`block text-center py-3.5 rounded-[10px] text-[15px] font-bold transition-all no-underline ${
                    isFeatured
                      ? "bg-white text-primary hover:bg-primary-ultra"
                      : "bg-transparent text-primary border border-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  اختر الباقة
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
