// WhatsApp Promo Section
export function WhatsAppPromoSection() {
  return (
    <section className="py-[72px] px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-3.5">💬 واتساب كوميرس</div>
            <h2 className="text-[clamp(22px,2.5vw,32px)] font-black text-secondary mb-3.5">اطلب مباشرة عبر واتساب</h2>
            <p className="text-[15px] text-gray-500 leading-[1.8] mb-7">
              لا تعقيدات، لا بوابات دفع، لا انتظار. كل طلب يصل مباشرة لصاحب المتجر عبر واتساب فوراً.
            </p>
            <div className="flex flex-col gap-3">
              {["رسائل طلب تلقائية مخصصة","تواصل مباشر بين المشتري والبائع","لا عمولات على الطلبات","تأكيد فوري من صاحب المتجر"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-[14px] text-gray-700 font-medium">
                  <div className="w-[22px] h-[22px] bg-success-light rounded-full flex items-center justify-center text-[12px] text-green-700 flex-shrink-0">✓</div>
                  {f}
                </div>
              ))}
            </div>
          </div>
          {/* WA chat mockup */}
          <div className="flex justify-center">
            <div className="bg-[#ECE5DD] rounded-[20px] p-5 max-w-[320px] w-full">
              <div className="bg-[#075E54] text-white rounded-[10px_10px_0_0] px-4 py-3 text-[13px] font-bold flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">🏪</div>
                <div><div>Tech World</div><div className="text-[10px] opacity-70">متجر زون</div></div>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="bg-white rounded-[0_12px_12px_12px] p-3.5 text-[12px] leading-[1.8] text-secondary max-w-[80%]">
                  السلام عليكم 👋<br/>أرغب في طلب:<br/><strong>ساعة ذكية Galaxy Watch</strong><br/>السعر: 1,199 ج.م<br/>من متجر: Tech World
                  <div className="text-[10px] text-gray-400 text-left mt-1">10:24 ✓✓</div>
                </div>
                <div className="bg-[#DCF8C6] rounded-[12px_0_12px_12px] p-3.5 text-[12px] leading-[1.8] text-secondary max-w-[80%] self-end">
                  أهلاً بك! سيتم تجهيز طلبك فوراً 😊<br/>ما هو عنوان التوصيل؟
                  <div className="text-[10px] text-gray-400 text-left mt-1">10:25 ✓✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default WhatsAppPromoSection;
