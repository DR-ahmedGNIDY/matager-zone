"use client";
import { buildWhatsAppUrl, isStoreOpenNow, formatRelativeTime } from "@/lib/utils";

interface StoreInfoSidebarProps {
  store: {
    name: string; whatsappNumber: string; countryCode?: string;
    city?: string | null; country?: string | null; address?: string | null;
    businessHours?: Record<string, { isOpen: boolean; openTime: string; closeTime: string }> | null;
    instagramUrl?: string | null; tiktokUrl?: string | null;
    facebookUrl?: string | null; twitterUrl?: string | null;
    createdAt: string | Date;
    _count?: { products?: number; reviews?: number; followers?: number };
    averageRating?: number;
  };
  category?: { nameAr: string; emoji: string } | null;
}

const DAYS_AR: Record<string, string> = {
  saturday: "السبت", sunday: "الأحد", monday: "الاثنين",
  tuesday: "الثلاثاء", wednesday: "الأربعاء", thursday: "الخميس", friday: "الجمعة",
};

export default function StoreInfoSidebar({ store, category }: StoreInfoSidebarProps) {
  const phone = (store.countryCode || "20") + store.whatsappNumber;
  const waMsg = `السلام عليكم\nأريد الاستفسار عن متجر ${store.name}\nشكراً`;
  const isOpen = isStoreOpenNow(store.businessHours || null);

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden sticky top-[calc(68px+80px)]">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
            isOpen ? "bg-success-light text-green-700" : "bg-danger-light text-red-700"
          }`}>
            {isOpen ? <>● مفتوح الآن</> : "● مغلق الآن"}
          </span>
          {isOpen && store.businessHours && (
            <span className="text-[12px] text-gray-400">يغلق 10 م</span>
          )}
        </div>

        <button onClick={() => window.open(buildWhatsAppUrl(phone, waMsg), "_blank")}
          className="w-full flex items-center justify-center gap-2.5 bg-wa hover:bg-wa-dark text-white font-black text-[16px] py-4 rounded-[16px] border-none cursor-pointer transition-all mb-2.5"
          style={{ boxShadow: "0 8px 24px rgba(37,211,102,.3)" }}>
          💬 تواصل عبر واتساب
        </button>
        <a href={`tel:+${phone}`}
          className="w-full flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:border-primary hover:text-primary text-secondary font-bold text-[13px] py-2.5 rounded-[10px] transition-all no-underline text-center">
          📞 +{phone}
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px bg-gray-100">
        {[
          { val: store._count?.products || 0,  lbl: "منتج" },
          { val: store.averageRating?.toFixed(1) || "—", lbl: "تقييم" },
          { val: store._count?.followers || 0, lbl: "متابع" },
          { val: store._count?.reviews || 0,   lbl: "مراجعة" },
        ].map(({ val, lbl }) => (
          <div key={lbl} className="bg-white p-4 text-center">
            <div className="text-[20px] font-black text-secondary">{typeof val === "number" ? val.toLocaleString("ar-EG") : val}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col gap-3.5">
        {store.city && (
          <div className="flex items-start gap-2.5 text-[13px]">
            <div className="w-8 h-8 bg-gray-50 rounded-[8px] flex items-center justify-center flex-shrink-0">📍</div>
            <div><div className="text-[11px] text-gray-400">الموقع</div><div className="font-semibold text-secondary">{store.city}{store.country ? `، ${store.country}` : ""}</div></div>
          </div>
        )}
        {category && (
          <div className="flex items-start gap-2.5 text-[13px]">
            <div className="w-8 h-8 bg-gray-50 rounded-[8px] flex items-center justify-center flex-shrink-0">🏷️</div>
            <div><div className="text-[11px] text-gray-400">التصنيف</div><div className="font-semibold text-secondary">{category.emoji} {category.nameAr}</div></div>
          </div>
        )}
        <div className="flex items-start gap-2.5 text-[13px]">
          <div className="w-8 h-8 bg-gray-50 rounded-[8px] flex items-center justify-center flex-shrink-0">📅</div>
          <div><div className="text-[11px] text-gray-400">عضو منذ</div><div className="font-semibold text-secondary">{new Date(store.createdAt).getFullYear()}</div></div>
        </div>

        {/* Business hours */}
        {store.businessHours && (
          <div className="flex items-start gap-2.5 text-[13px]">
            <div className="w-8 h-8 bg-gray-50 rounded-[8px] flex items-center justify-center flex-shrink-0">⏰</div>
            <div className="flex-1">
              <div className="text-[11px] text-gray-400 mb-1.5">ساعات العمل</div>
              <div className="flex flex-col gap-1">
                {Object.entries(store.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-[12px]">
                    <span className="text-gray-500">{DAYS_AR[day] || day}</span>
                    {hours.isOpen
                      ? <span className="font-semibold text-secondary">{hours.openTime} - {hours.closeTime}</span>
                      : <span className="text-danger">مغلق</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social links */}
        {(store.instagramUrl || store.tiktokUrl || store.facebookUrl || store.twitterUrl) && (
          <>
            <div className="h-px bg-gray-100" />
            <div>
              <div className="text-[12px] font-bold text-gray-400 mb-2">تابعنا على</div>
              <div className="flex gap-2">
                {[
                  { url: store.instagramUrl, icon: "📸" },
                  { url: store.tiktokUrl,    icon: "🎵" },
                  { url: store.facebookUrl,  icon: "📘" },
                  { url: store.twitterUrl,   icon: "🐦" },
                ].filter((s) => s.url).map((s) => (
                  <a key={s.icon} href={s.url!} target="_blank" rel="noopener noreferrer"
                    className="w-[34px] h-[34px] bg-gray-100 rounded-[8px] flex items-center justify-center text-base hover:bg-primary-ultra transition-all no-underline">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
