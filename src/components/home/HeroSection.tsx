import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="min-h-[620px] relative overflow-hidden flex items-center px-6 py-20"
      style={{ background: "linear-gradient(135deg, #EEF1FF 0%, #F8FAFC 50%, #FFF7ED 100%)" }}
    >
      {/* Radial glows */}
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,107,255,0.12) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)" }} />

      <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* Content */}
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            🚀 منصة متكاملة لإنشاء وإدارة المتاجر
          </div>

          <h1 className="text-[clamp(32px,4vw,52px)] font-black leading-[1.2] text-secondary mb-5">
            منصة متكاملة<br />
            <span className="text-primary">لإنشاء وإدارة</span><br />
            المتاجر الرقمية
          </h1>

          <p className="text-[17px] text-gray-500 leading-[1.8] mb-9 max-w-[480px]">
            أنشئ متجرك الإلكتروني في دقائق وابدأ البيع لآلاف العملاء من خلال منصة واحدة متكاملة.
            الطلبات تصل مباشرة عبر واتساب.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/dashboard/store-owner/create"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-base rounded-[16px] transition-all shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 no-underline"
            >
              افتح متجرك الآن ←
            </Link>
            <Link
              href="/stores"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 hover:border-primary hover:text-primary text-secondary font-bold text-base rounded-[16px] transition-all hover:-translate-y-0.5 no-underline"
            >
              استكشف المتاجر
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex items-center gap-3 mt-9">
            <div className="flex">
              {["أ", "م", "س", "ع", "ر"].map((letter, i) => (
                <div
                  key={i}
                  className="w-[34px] h-[34px] bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                  style={{ marginLeft: i === 0 ? 0 : "-10px", zIndex: 5 - i }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="text-[13px] text-gray-500 font-medium">
              <strong className="text-secondary font-bold">+500 متجر</strong> يثقون في متاجر زون
            </div>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="hidden lg:flex justify-center items-center relative">
          <div
            className="w-[280px] rounded-[40px] p-3 relative z-10"
            style={{
              background: "#1E293B",
              boxShadow: "0 40px 80px rgba(30,41,59,0.25), 0 0 0 1px rgba(255,255,255,0.1)"
            }}
          >
            <div className="bg-white rounded-[32px] overflow-hidden h-[480px]">
              <div className="p-4">
                {/* Phone screen header */}
                <div className="bg-primary rounded-[12px] p-2.5 flex items-center gap-2 mb-3.5">
                  <div className="w-6 h-6 bg-white rounded-[6px] flex items-center justify-center text-primary text-xs">🛍️</div>
                  <span className="text-white text-[11px] font-bold">متاجر زون</span>
                </div>

                {/* Search bar */}
                <div className="bg-gray-100 rounded-[8px] px-3 py-2 text-[11px] text-gray-400 mb-3.5 flex items-center gap-1.5">
                  🔍 ابحث عن منتجات أو متاجر...
                </div>

                <div className="text-[10px] font-black text-secondary mb-2">المنتجات المميزة</div>

                {/* Product grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { bg: "#f0f4ff", em: "⌚", name: "ساعة ذكية", price: "1,199 ج.م" },
                    { bg: "#fff8e0", em: "👜", name: "شنطة كلاسيك", price: "599 ج.م" },
                    { bg: "#ffe4e6", em: "💄", name: "عطر فاخر", price: "850 ج.م" },
                    { bg: "#d1fae5", em: "🎧", name: "سماعات", price: "679 ج.م" },
                  ].map((p) => (
                    <div key={p.name} className="bg-gray-50 rounded-[10px] overflow-hidden border border-gray-100">
                      <div className="h-[60px] flex items-center justify-center text-2xl" style={{ background: p.bg }}>
                        {p.em}
                      </div>
                      <div className="p-1.5">
                        <div className="text-[9px] font-bold text-secondary">{p.name}</div>
                        <div className="text-[9px] font-bold text-primary">{p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WA button */}
                <div className="mt-3 bg-[#25D366] text-white rounded-[8px] py-2 text-[11px] font-bold text-center flex items-center justify-center gap-1">
                  💬 اطلب عبر واتساب
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="absolute -top-5 -right-10 bg-white rounded-[16px] px-3.5 py-3 shadow-md border border-gray-100 z-20 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-success-light rounded-[8px] flex items-center justify-center text-base">✅</div>
              <div>
                <div className="text-[10px] text-gray-400">طلب جديد</div>
                <div className="text-[13px] font-black text-secondary">+12 طلب اليوم</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 -right-12 bg-white rounded-[16px] px-3.5 py-3 shadow-md border border-gray-100 z-20 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-warning-light rounded-[8px] flex items-center justify-center text-base">⭐</div>
              <div>
                <div className="text-[10px] text-gray-400">التقييم</div>
                <div className="text-[13px] font-black text-secondary">4.9 / 5.0</div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-8 bg-white rounded-[16px] px-3.5 py-3 shadow-md border border-gray-100 z-20 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-ultra rounded-[8px] flex items-center justify-center text-base">📦</div>
              <div>
                <div className="text-[10px] text-gray-400">المبيعات</div>
                <div className="text-[13px] font-black text-secondary">+1M ج.م</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
