const TESTIMONIALS = [
  { name: "أحمد محمد", store: "صاحب متجر Tech World", rating: 5, color: "bg-primary", initial: "أ",
    text: "منصة رائعة جداً، أنشأت متجري في أقل من ساعة وبدأت في استقبال الطلبات عبر واتساب فوراً. تجربة مذهلة!" },
  { name: "منى حسين", store: "صاحبة متجر Glow Beauty", rating: 5, color: "bg-accent", initial: "م",
    text: "الفكرة مبتكرة جداً، الطلبات عبر واتساب أسهل بكثير من أي نظام دفع معقد. عملائي يحبون البساطة!" },
  { name: "سارة عبدالله", store: "صاحبة متجر Fashion Style", rating: 5, color: "bg-success", initial: "س",
    text: "زادت مبيعاتي بنسبة 300% بعد الانضمام لمتاجر زون. لوحة التحكم سهلة والدعم الفني ممتاز." },
];

export function TestimonialsSection() {
  return (
    <section className="py-[72px] px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3.5">💬 آراء التجار</div>
          <h2 className="text-[clamp(22px,3vw,34px)] font-black text-secondary mb-2.5">ماذا يقول أصحاب المتاجر؟</h2>
          <p className="text-[15px] text-gray-500">آلاف التجار يثقون في منصة متاجر زون لإدارة متاجرهم</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white border border-gray-100 rounded-[24px] p-6 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex gap-0.5 mb-3.5">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-accent text-sm">{s}</span>
                ))}
              </div>
              <p className="text-[14px] text-gray-600 leading-[1.8] mb-5">"{t.text}"</p>
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>{t.initial}</div>
                <div>
                  <div className="text-[14px] font-bold text-secondary">{t.name}</div>
                  <div className="text-[12px] text-gray-400">{t.store}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "كيف يعمل نظام الطلبات في متاجر زون؟",    a: "عندما يضغط العميل على زر 'اطلب عبر واتساب'، يتم توليد رسالة طلب تلقائية تحتوي على تفاصيل المنتج وترسل مباشرة إلى واتساب صاحب المتجر. لا يوجد بوابة دفع أو أي عملية معقدة." },
  { q: "هل يمكنني إضافة منتجات من متاجر مختلفة؟", a: "لا، لأن كل متجر له رقم واتساب خاص به. يمكنك إضافة منتجات من متجر واحد فقط في الطلب. إذا أردت منتجات من متجر آخر، يجب إتمام الطلب الحالي أولاً." },
  { q: "كم تكلفة إنشاء متجر على المنصة؟",         a: "تبدأ الباقات من 199 ج.م شهرياً مع تجربة مجانية لمدة 14 يوم. لدينا ثلاث باقات: Starter، Professional، و Enterprise تناسب جميع احتياجات التجار." },
  { q: "هل تأخذ المنصة عمولة على الطلبات؟",       a: "لا، منصة متاجر زون لا تأخذ أي عمولة على الطلبات أو المبيعات. نحن نعمل فقط بنظام الاشتراك الشهري أو السنوي." },
  { q: "هل يدعم المنصة اللغة العربية بالكامل؟",   a: "نعم، المنصة مصممة بشكل أولي للغة العربية مع دعم كامل لاتجاه RTL وتدعم أيضاً اللغة الإنجليزية LTR." },
];

export function FaqSection() {
  return (
    <section className="py-[72px] px-6 bg-white" id="faq">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3.5">❓ الأسئلة الشائعة</div>
          <h2 className="text-[clamp(22px,3vw,34px)] font-black text-secondary mb-2.5">هل لديك تساؤلات؟</h2>
          <p className="text-[15px] text-gray-500">إليك إجابات على أكثر الأسئلة شيوعاً</p>
        </div>
        <div className="max-w-[760px] mx-auto flex flex-col gap-3">
          {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} defaultOpen={i === 0} />)}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  // Static rendering — no client state needed for SEO; use details/summary
  return (
    <details className="bg-white border border-gray-100 rounded-[16px] overflow-hidden group" open={defaultOpen}>
      <summary className="flex items-center justify-between px-5 py-[18px] cursor-pointer text-[15px] font-bold text-secondary hover:text-primary transition-colors list-none [&::-webkit-details-marker]:hidden">
        {q}
        <span className="w-6 h-6 bg-gray-100 group-open:bg-primary-ultra group-open:text-primary rounded-full flex items-center justify-center text-[14px] text-gray-400 flex-shrink-0 transition-all group-open:rotate-45">+</span>
      </summary>
      <div className="px-5 pb-[18px] text-[14px] text-gray-500 leading-[1.8]">{a}</div>
    </details>
  );
}

export function CtaSection() {
  return (
    <section
      className="py-20 px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #4F6BFF 0%, #6B83FF 100%)" }}
    >
      <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] bg-white/6 rounded-full pointer-events-none" />
      <div className="absolute -bottom-[80px] -left-[80px] w-[300px] h-[300px] bg-white/6 rounded-full pointer-events-none" />
      <div className="max-w-[700px] mx-auto text-center relative z-10">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-[clamp(26px,3.5vw,42px)] font-black text-white mb-4">جاهز لبدء متجرك الآن؟</h2>
        <p className="text-[17px] text-white/80 mb-9">انضم إلى مئات التجار وابدأ البيع عبر منصة متاجر زون. تجربة مجانية 14 يوم بدون بطاقة ائتمان.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="/dashboard/store-owner/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-primary-ultra text-primary font-bold text-base rounded-[16px] transition-all no-underline">
            افتح متجرك الآن ←
          </a>
          <a href="/stores"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-base rounded-[16px] transition-all no-underline">
            استكشف المتاجر
          </a>
        </div>
      </div>
    </section>
  );
}
