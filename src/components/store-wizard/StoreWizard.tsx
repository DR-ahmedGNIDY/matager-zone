"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WizardProgress, StorePreviewCard } from "./WizardProgress";
import { STORE_CATEGORIES, COUNTRIES, PRIMARY_COLORS } from "@/lib/constants";
import { createStoreSchema, type CreateStoreInput } from "@/validators/store";
import { generateSlug, cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const STEPS = [
  { label: "المعلومات" },
  { label: "الهوية" },
  { label: "واتساب" },
  { label: "ساعات العمل" },
  { label: "SEO وإطلاق" },
];

const DEFAULT_HOURS = {
  saturday:  { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  sunday:    { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  monday:    { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  tuesday:   { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  wednesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  thursday:  { isOpen: true, openTime: "09:00", closeTime: "22:00" },
  friday:    { isOpen: false, openTime: "14:00", closeTime: "22:00" },
};

const DAY_LABELS: Record<string, string> = {
  saturday: "السبت", sunday: "الأحد", monday: "الاثنين",
  tuesday: "الثلاثاء", wednesday: "الأربعاء", thursday: "الخميس", friday: "الجمعة",
};

export default function StoreWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selectedCat, setSelectedCat] = useState<{ emoji: string; nameAr: string } | null>(null);
  const [hours, setHours] = useState(DEFAULT_HOURS);

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      primaryColor: "#4F6BFF", countryCode: "20", orderButtonText: "اطلب عبر واتساب",
      businessHours: DEFAULT_HOURS,
    },
  });

  const watchedName = watch("name", "");
  const watchedDesc = watch("description", "");
  const watchedColor = watch("primaryColor", "#4F6BFF");
  const watchedSlug = watch("slug", "");

  const nextStep = () => setStep((s) => Math.min(5, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async (data: CreateStoreInput) => {
    setServerError("");
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, businessHours: hours }),
      });
      const json = await res.json();
      if (!json.success) { setServerError(json.error || "حدث خطأ"); return; }
      setSuccess(true);
    } catch { setServerError("حدث خطأ. حاول مرة أخرى."); }
  };

  if (success) {
    const adminWaMsg = encodeURIComponent("السلام عليكم، أرغب في استكمال قبول متجري على منصة متاجر زون. اسم المتجر: " + (watchedName || "متجري"));
    const adminWaUrl = `https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA || "201000000000"}?text=${adminWaMsg}`;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-[24px] font-black text-secondary mb-2">طلبك تحت المراجعة</h2>
          <p className="text-gray-500 text-[15px] mb-3 leading-relaxed">
            تم استلام طلب إنشاء متجرك بنجاح. فريق متاجر زون سيراجع طلبك ويتواصل معك.
          </p>
          <div className="bg-primary-ultra border border-primary/20 rounded-[16px] p-5 mb-7 text-right">
            <div className="text-[14px] font-black text-secondary mb-2">الخطوة التالية:</div>
            <p className="text-[13px] text-gray-600 leading-relaxed">
              راسل فريق الإدارة على واتساب لاستكمال قبول متجرك وبدء الإعلان. 
              سيتم تفعيل متجرك بعد التحقق من بياناتك.
            </p>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <a
              href={adminWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-sm flex items-center justify-center gap-2.5 bg-wa hover:bg-wa-dark text-white font-black text-[16px] py-4 rounded-[16px] no-underline transition-all"
              style={{ boxShadow: "0 8px 24px rgba(37,211,102,.3)" }}
            >
              💬 راسل الإدارة على واتساب
            </a>
            <button
              onClick={() => router.push("/dashboard/store-owner")}
              className="btn btn-outline w-full max-w-sm"
            >
              انتقل للوحة التحكم
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1060px] mx-auto px-6 pb-12">
      {/* Progress */}
      <div className="bg-white border-b border-gray-100 py-4 px-6 -mx-6 mb-6 sticky top-[68px] z-10">
        <div className="max-w-[860px] mx-auto">
          <WizardProgress currentStep={step} totalSteps={5} steps={STEPS} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        {/* Form card */}
        <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-[11px] font-bold px-3 py-1 rounded-full mb-2">الخطوة 1 من 5</div>
                  <h2 className="text-[20px] font-black text-secondary">🏪 المعلومات الأساسية</h2>
                  <p className="text-[13px] text-gray-400">أدخل المعلومات الأساسية لمتجرك</p>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <div>
                    <label className="form-label">اسم المتجر *</label>
                    <input {...register("name")} className={cn("form-input", errors.name && "border-danger")}
                      placeholder="مثال: Tech World"
                      onChange={(e) => {
                        register("name").onChange(e);
                        setValue("slug", generateSlug(e.target.value));
                      }} />
                    {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">وصف المتجر *</label>
                    <textarea {...register("description")} className={cn("form-input min-h-[100px]", errors.description && "border-danger")}
                      placeholder="اكتب وصفاً جذاباً يعبر عن متجرك..." />
                    {errors.description && <p className="text-danger text-xs mt-1">{errors.description.message}</p>}
                  </div>
                  <div>
                    <label className="form-label mb-2 block">تصنيف المتجر *</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {STORE_CATEGORIES.map((cat) => {
                        const isActive = getValues("categoryId") === cat.slug;
                        return (
                          <button type="button" key={cat.slug}
                            onClick={() => { setValue("categoryId", cat.slug); setSelectedCat({ emoji: cat.emoji, nameAr: cat.nameAr }); }}
                            className={cn("border-2 rounded-[12px] p-3 text-center cursor-pointer transition-all",
                              isActive ? "border-primary bg-primary-ultra" : "border-gray-200 hover:border-primary hover:bg-primary-ultra bg-white")}>
                            <span className="text-2xl block mb-1">{cat.emoji}</span>
                            <span className="text-[11px] font-bold text-secondary">{cat.nameAr}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.categoryId && <p className="text-danger text-xs mt-1">{errors.categoryId.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">الدولة *</label>
                      <select {...register("country")} className={cn("form-input", errors.country && "border-danger")}>
                        <option value="">اختر الدولة</option>
                        {COUNTRIES.map((c) => <option key={c.code} value={c.nameAr}>{c.flag} {c.nameAr}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">المدينة *</label>
                      <input {...register("city")} className={cn("form-input", errors.city && "border-danger")} placeholder="القاهرة" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">العنوان التفصيلي</label>
                    <input {...register("address")} className="form-input" placeholder="شارع التحرير، وسط البلد" />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button type="button" onClick={nextStep} className="btn btn-primary">التالي: هوية المتجر ←</button>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-[11px] font-bold px-3 py-1 rounded-full mb-2">الخطوة 2 من 5</div>
                  <h2 className="text-[20px] font-black text-secondary">🎨 هوية المتجر البصرية</h2>
                  <p className="text-[13px] text-gray-400">أضف شعاراً وصورة غلاف مميزة</p>
                </div>
                <div className="px-6 py-5 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">شعار المتجر</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-[12px] p-6 text-center hover:border-primary hover:bg-primary-ultra transition-all cursor-pointer">
                        <span className="text-3xl block mb-2">🖼️</span>
                        <div className="text-[12px] font-bold text-secondary">رفع الشعار</div>
                        <div className="text-[11px] text-gray-400">PNG أو SVG · 500×500</div>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">صورة الغلاف</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-[12px] p-6 text-center hover:border-primary hover:bg-primary-ultra transition-all cursor-pointer h-full">
                        <span className="text-3xl block mb-2">🖼️</span>
                        <div className="text-[12px] font-bold text-secondary">رفع صورة الغلاف</div>
                        <div className="text-[11px] text-gray-400">JPG أو PNG · 1200×400</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="form-label mb-2 block">اللون الرئيسي للمتجر</label>
                    <div className="flex gap-2 flex-wrap items-center">
                      {PRIMARY_COLORS.map((color) => (
                        <button type="button" key={color}
                          onClick={() => setValue("primaryColor", color)}
                          className={cn("w-8 h-8 rounded-[8px] border-[3px] transition-all cursor-pointer",
                            watchedColor === color ? "border-gray-900 scale-110" : "border-transparent")}
                          style={{ background: color }}
                        />
                      ))}
                      <input type="color" {...register("primaryColor")} className="w-9 h-8 rounded-[8px] cursor-pointer border-none" />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between">
                  <button type="button" onClick={prevStep} className="btn btn-outline">← السابق</button>
                  <button type="button" onClick={nextStep} className="btn btn-primary">التالي: واتساب ←</button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-[11px] font-bold px-3 py-1 rounded-full mb-2">الخطوة 3 من 5</div>
                  <h2 className="text-[20px] font-black text-secondary">💬 إعدادات واتساب</h2>
                  <p className="text-[13px] text-gray-400">واتساب هو قلب المنصة — أدخل بياناتك بدقة</p>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <div className="bg-primary-ultra rounded-[12px] p-3.5 flex gap-2.5 text-[13px] text-primary">
                    <span>💡</span>
                    <span>رقم الواتساب هو العمود الفقري لمتجرك. كل طلبات عملائك ستصل مباشرة على هذا الرقم.</span>
                  </div>
                  <div>
                    <label className="form-label">رقم واتساب المتجر *</label>
                    <div className="flex">
                      <select {...register("countryCode")} className="border border-gray-200 border-l-0 rounded-r-[10px] px-3 py-2.5 text-[13px] bg-gray-50 outline-none cursor-pointer min-w-[110px]">
                        {COUNTRIES.map((c) => <option key={c.code} value={c.dialCode}>{c.flag} +{c.dialCode}</option>)}
                      </select>
                      <input {...register("whatsappNumber")} type="tel" dir="ltr"
                        className={cn("flex-1 form-input rounded-l-[10px] rounded-r-none border-r-0", errors.whatsappNumber && "border-danger")}
                        placeholder="1234567890" />
                    </div>
                    {errors.whatsappNumber && <p className="text-danger text-xs mt-1">{errors.whatsappNumber.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">رسالة الترحيب التلقائية</label>
                    <textarea {...register("welcomeMessage")} className="form-input min-h-[80px]"
                      placeholder="أهلاً وسهلاً بكم في متجرنا! 👋 يسعدنا خدمتكم." />
                  </div>
                  <div>
                    <label className="form-label">نص زر الطلب</label>
                    <input {...register("orderButtonText")} className="form-input" placeholder="اطلب عبر واتساب" />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <label className="form-label">روابط التواصل الاجتماعي</label>
                    {[
                      { name: "instagramUrl" as const, icon: "📸", ph: "رابط إنستجرام" },
                      { name: "tiktokUrl"    as const, icon: "🎵", ph: "رابط تيك توك" },
                      { name: "facebookUrl"  as const, icon: "📘", ph: "رابط فيسبوك" },
                      { name: "twitterUrl"   as const, icon: "🐦", ph: "رابط تويتر / X" },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-[8px] flex items-center justify-center text-base flex-shrink-0">{s.icon}</div>
                        <input {...register(s.name)} type="url" className="form-input flex-1" placeholder={s.ph} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between">
                  <button type="button" onClick={prevStep} className="btn btn-outline">← السابق</button>
                  <button type="button" onClick={nextStep} className="btn btn-primary">التالي: ساعات العمل ←</button>
                </div>
              </>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <>
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-[11px] font-bold px-3 py-1 rounded-full mb-2">الخطوة 4 من 5</div>
                  <h2 className="text-[20px] font-black text-secondary">⏰ ساعات العمل</h2>
                  <p className="text-[13px] text-gray-400">حدد أيام وساعات عمل متجرك</p>
                </div>
                <div className="px-6 py-5">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-right text-[11px] font-bold text-gray-400 py-2 px-1">اليوم</th>
                        <th className="text-center text-[11px] font-bold text-gray-400 py-2 px-1">مفتوح</th>
                        <th className="text-right text-[11px] font-bold text-gray-400 py-2 px-1">من</th>
                        <th className="text-right text-[11px] font-bold text-gray-400 py-2 px-1">إلى</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(hours).map(([day, h]) => (
                        <tr key={day} className="border-b border-gray-50">
                          <td className="py-2.5 px-1 font-semibold text-[13px] text-secondary">{DAY_LABELS[day]}</td>
                          <td className="py-2.5 px-1 text-center">
                            <button type="button"
                              onClick={() => setHours((prev) => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], isOpen: !h.isOpen } }))}
                              className={`w-10 h-5 rounded-full relative transition-all border-none cursor-pointer ${h.isOpen ? "bg-success" : "bg-gray-300"}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${h.isOpen ? "left-0.5" : "right-0.5"}`} />
                            </button>
                          </td>
                          <td className="py-2.5 px-1">
                            <input type="time" value={h.openTime} disabled={!h.isOpen}
                              onChange={(e) => setHours((p) => ({ ...p, [day]: { ...p[day as keyof typeof p], openTime: e.target.value } }))}
                              className="border border-gray-200 rounded-[8px] px-2 py-1.5 text-[12px] outline-none disabled:opacity-40 w-24" />
                          </td>
                          <td className="py-2.5 px-1">
                            <input type="time" value={h.closeTime} disabled={!h.isOpen}
                              onChange={(e) => setHours((p) => ({ ...p, [day]: { ...p[day as keyof typeof p], closeTime: e.target.value } }))}
                              className="border border-gray-200 rounded-[8px] px-2 py-1.5 text-[12px] outline-none disabled:opacity-40 w-24" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between">
                  <button type="button" onClick={prevStep} className="btn btn-outline">← السابق</button>
                  <button type="button" onClick={nextStep} className="btn btn-primary">التالي: SEO وإطلاق ←</button>
                </div>
              </>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <>
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="inline-flex items-center gap-1.5 bg-primary-ultra text-primary text-[11px] font-bold px-3 py-1 rounded-full mb-2">الخطوة 5 من 5 — الأخيرة!</div>
                  <h2 className="text-[20px] font-black text-secondary">🚀 SEO وإطلاق المتجر</h2>
                  <p className="text-[13px] text-gray-400">أعد إعدادات SEO لتحسين ظهورك في محركات البحث</p>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <div>
                    <label className="form-label">رابط المتجر (Slug) *</label>
                    <input {...register("slug")} dir="ltr"
                      className={cn("form-input", errors.slug && "border-danger")}
                      placeholder="tech-world" />
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-[10px] px-3 py-2 text-[13px] mt-1.5">
                      <span className="text-gray-400">https://</span>
                      <span className="text-primary font-bold">{watchedSlug || "your-store"}</span>
                      <span className="text-gray-400">.mtajerzone.com</span>
                    </div>
                    {errors.slug && <p className="text-danger text-xs mt-1">{errors.slug.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">عنوان SEO</label>
                    <input {...register("seoTitle")} className="form-input" placeholder="Tech World — أفضل متجر إلكتروني" />
                    <div className="text-[11px] text-gray-400 text-left mt-0.5">{(watch("seoTitle") ?? "").length} / 60</div>
                  </div>
                  <div>
                    <label className="form-label">وصف SEO</label>
                    <textarea {...register("seoDescription")} className="form-input min-h-[72px]" placeholder="وصف موجز يظهر في نتائج البحث..." />
                    <div className="text-[11px] text-gray-400 text-left mt-0.5">{(watch("seoDescription") ?? "").length} / 160</div>
                  </div>
                  <div className="bg-success-light border border-green-200 rounded-[12px] p-4">
                    <div className="font-bold text-green-700 text-[13px] mb-1.5">✅ متجرك جاهز للإطلاق!</div>
                    <div className="text-[12px] text-green-600 leading-relaxed">
                      · سيتم مراجعة متجرك خلال 24 ساعة<br/>
                      · ستصلك رسالة واتساب عند التفعيل<br/>
                      · يمكنك البدء في إضافة منتجاتك فور الموافقة
                    </div>
                  </div>
                  {serverError && <p className="text-danger text-sm bg-danger-light rounded-[10px] px-4 py-3">{serverError}</p>}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between">
                  <button type="button" onClick={prevStep} className="btn btn-outline">← السابق</button>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? "جاري الإنشاء..." : "🚀 إطلاق المتجر الآن!"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Preview sidebar + tips */}
        <div className="flex flex-col gap-4">
          <StorePreviewCard
            name={watchedName || undefined}
            description={watchedDesc || undefined}
            emoji={selectedCat?.emoji}
            categoryName={selectedCat?.nameAr}
            primaryColor={watchedColor}
          />
          <div className="bg-white rounded-[20px] border border-gray-100 p-4">
            <div className="text-[12px] font-black text-secondary mb-3 flex items-center gap-1.5">💡 نصائح للنجاح</div>
            {[
              "اختر اسماً مميزاً وسهل التذكر",
              "أضف صورة غلاف احترافية وجذابة",
              "اكتب وصفاً واضحاً يشرح ما يميزك",
              "تأكد أن رقم الواتساب صحيح ونشط",
              "أضف روابط التواصل لزيادة المتابعين",
            ].map((tip, i) => (
              <div key={i} className="flex gap-2 text-[12px] text-gray-500 mb-2">
                <div className="w-4.5 h-4.5 bg-primary-ultra text-primary rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">{i+1}</div>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
