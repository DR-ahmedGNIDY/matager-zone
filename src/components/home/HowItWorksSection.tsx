const STEPS = [
  { num: 1, icon: "👤", title: "إنشاء حساب",       desc: "سجّل حسابك بسهولة وأمان في ثوانٍ معدودة" },
  { num: 2, icon: "🏪", title: "فتح متجر",         desc: "أكمل بيانات متجرك التجارية واختر الباقة المناسبة" },
  { num: 3, icon: "📦", title: "إضافة المنتجات",   desc: "أضف منتجاتك بسهولة مع الصور والأوصاف والأسعار" },
  { num: 4, icon: "💬", title: "استقبال الطلبات",  desc: "استقبل طلبات عملائك مباشرة عبر واتساب بسهولة" },
  { num: 5, icon: "💰", title: "تحقيق المبيعات",   desc: "حقق أرباحك من المبيعات وتابع تحليلات متجرك" },
];

export default function HowItWorksSection() {
  return (
    <section className="py-[72px] px-6 bg-white" id="how">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3.5">❓ كيف تعمل المنصة؟</div>
          <h2 className="text-[clamp(22px,3vw,34px)] font-black text-secondary mb-2.5">خطوات بسيطة لبدء متجرك وتحقيق النجاح</h2>
          <p className="text-[15px] text-gray-500 max-w-[500px] mx-auto">أنشئ متجرك في خطوات بسيطة وابدأ في استقبال الطلبات عبر واتساب فوراً</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-0 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 right-[10%] left-[10%] h-0.5 bg-gradient-to-l from-primary to-primary-light z-0" />

          {STEPS.map((step, i) => (
            <div key={step.num} className="text-center relative z-10 group">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 relative transition-all group-hover:scale-110 ${
                  i === 0
                    ? "bg-primary border-2 border-primary shadow-primary"
                    : "bg-white border-2 border-gray-200 shadow-sm group-hover:border-primary group-hover:shadow-primary"
                }`}
              >
                <span className={i === 0 ? "filter brightness-0 invert" : ""}>{step.icon}</span>
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center"
                >
                  {step.num}
                </span>
              </div>
              <div className="text-[14px] font-black text-secondary mb-1.5 group-hover:text-primary transition-colors">{step.title}</div>
              <div className="text-[12px] text-gray-500 leading-relaxed px-2">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
