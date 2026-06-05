"use client";
import { useState, useTransition } from "react";
import { updateStoreSettingsAction } from "@/actions/store.actions";
import { COUNTRIES, PRIMARY_COLORS } from "@/lib/constants";

interface StoreSettingsFormProps {
  store: {
    id: string; name: string; description: string; whatsappNumber: string;
    countryCode: string; welcomeMessage: string; orderButtonText: string;
    city: string; country: string; address: string; primaryColor: string;
    logo: string | null; cover: string | null;
    instagramUrl: string; tiktokUrl: string; facebookUrl: string;
    twitterUrl: string; websiteUrl: string;
    seoTitle: string; seoDescription: string;
    slug: string; status: string;
  };
}

export default function StoreSettingsForm({ store }: StoreSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Form fields
  const [name,            setName]            = useState(store.name);
  const [description,     setDescription]     = useState(store.description);
  const [whatsappNumber,  setWhatsappNumber]   = useState(store.whatsappNumber);
  const [countryCode,     setCountryCode]      = useState(store.countryCode);
  const [welcomeMessage,  setWelcomeMessage]   = useState(store.welcomeMessage);
  const [orderButtonText, setOrderButtonText]  = useState(store.orderButtonText);
  const [city,            setCity]             = useState(store.city);
  const [country,         setCountry]          = useState(store.country);
  const [primaryColor,    setPrimaryColor]     = useState(store.primaryColor);
  const [instagramUrl,    setInstagramUrl]     = useState(store.instagramUrl);
  const [tiktokUrl,       setTiktokUrl]        = useState(store.tiktokUrl);
  const [facebookUrl,     setFacebookUrl]      = useState(store.facebookUrl);
  const [twitterUrl,      setTwitterUrl]       = useState(store.twitterUrl);
  const [seoTitle,        setSeoTitle]         = useState(store.seoTitle);
  const [seoDescription,  setSeoDescription]   = useState(store.seoDescription);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateStoreSettingsAction({
        name, description, whatsappNumber, countryCode,
        welcomeMessage, orderButtonText, city, country,
        primaryColor, instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null, facebookUrl: facebookUrl || null,
        twitterUrl: twitterUrl || null, seoTitle, seoDescription,
      });
      setMsg({ text: result.success ? "✅ تم حفظ الإعدادات" : result.error ?? "حدث خطأ", ok: result.success });
      setTimeout(() => setMsg(null), 3000);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Store status banner if PENDING */}
      {store.status === "PENDING" && (
        <div className="bg-warning-light border border-amber-200 rounded-[16px] p-5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⏳</span>
          <div>
            <div className="font-black text-amber-800 mb-1">متجرك قيد المراجعة</div>
            <p className="text-[13px] text-amber-700 mb-3 leading-relaxed">
              يمكنك تعديل بيانات متجرك الآن. سيتم تفعيله بعد مراجعة فريق متاجر زون.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA || "201000000000"}?text=${encodeURIComponent("السلام عليكم، أرغب في استكمال قبول متجري: " + store.name)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-wa hover:bg-wa-dark text-white px-4 py-2 rounded-[10px] text-[13px] font-bold no-underline transition-all"
            >
              💬 راسل الإدارة على واتساب
            </a>
          </div>
        </div>
      )}

      {/* Basic info */}
      <Section title="📋 المعلومات الأساسية">
        <Row><Label>اسم المتجر *</Label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" /></Row>
        <Row><Label>الوصف</Label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className="form-input" rows={3} /></Row>
        <Row><Label>المدينة</Label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="form-input" placeholder="القاهرة" /></Row>
        <Row><Label>الدولة</Label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="form-input">
            <option value="">اختر الدولة</option>
            {COUNTRIES.map((c) => <option key={c.code} value={c.nameAr}>{c.flag} {c.nameAr}</option>)}
          </select></Row>
      </Section>

      {/* WhatsApp settings */}
      <Section title="💬 إعدادات واتساب">
        <Row><Label>رقم واتساب *</Label>
          <div className="flex">
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
              className="border border-gray-200 border-l-0 rounded-r-[10px] px-3 py-2.5 text-[13px] bg-gray-50 outline-none cursor-pointer min-w-[100px]">
              {COUNTRIES.map((c) => <option key={c.code} value={c.dialCode}>{c.flag} +{c.dialCode}</option>)}
            </select>
            <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)}
              className="flex-1 form-input rounded-l-[10px] rounded-r-none border-r-0"
              placeholder="1234567890" dir="ltr" />
          </div></Row>
        <Row><Label>رسالة الترحيب</Label>
          <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)}
            className="form-input" rows={2} placeholder="أهلاً وسهلاً..." /></Row>
        <Row><Label>نص زر الطلب</Label>
          <input value={orderButtonText} onChange={(e) => setOrderButtonText(e.target.value)}
            className="form-input" placeholder="اطلب عبر واتساب" /></Row>
      </Section>

      {/* Design */}
      <Section title="🎨 الهوية البصرية">
        <Row><Label>اللون الرئيسي</Label>
          <div className="flex gap-2 flex-wrap items-center">
            {PRIMARY_COLORS.map((c) => (
              <button type="button" key={c}
                onClick={() => setPrimaryColor(c)}
                className={`w-8 h-8 rounded-[8px] border-[3px] cursor-pointer transition-all ${primaryColor === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                style={{ background: c }} />
            ))}
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-9 h-8 rounded-[8px] cursor-pointer border-none" />
          </div></Row>
      </Section>

      {/* Social links */}
      <Section title="🔗 روابط التواصل الاجتماعي">
        {[
          { label: "📸 إنستجرام", value: instagramUrl, set: setInstagramUrl, ph: "https://instagram.com/..." },
          { label: "🎵 تيك توك",   value: tiktokUrl,    set: setTiktokUrl,    ph: "https://tiktok.com/@..." },
          { label: "📘 فيسبوك",   value: facebookUrl,  set: setFacebookUrl,  ph: "https://facebook.com/..." },
          { label: "🐦 تويتر",    value: twitterUrl,   set: setTwitterUrl,   ph: "https://twitter.com/..." },
        ].map((s) => (
          <Row key={s.label}><Label>{s.label}</Label>
            <input value={s.value} onChange={(e) => s.set(e.target.value)}
              className="form-input" placeholder={s.ph} dir="ltr" />
          </Row>
        ))}
      </Section>

      {/* SEO */}
      <Section title="🔍 SEO">
        <Row><Label>عنوان SEO</Label>
          <div>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="form-input" />
            <p className="text-[11px] text-gray-400 text-left mt-0.5">{seoTitle.length}/60</p>
          </div></Row>
        <Row><Label>وصف SEO</Label>
          <div>
            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="form-input" rows={2} />
            <p className="text-[11px] text-gray-400 text-left mt-0.5">{seoDescription.length}/160</p>
          </div></Row>
        <Row><Label>رابط المتجر</Label>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-[10px] px-3 py-2.5 text-[13px]">
            <span className="text-gray-400">mtajerzone.com/store/</span>
            <span className="text-primary font-bold">{store.slug}</span>
          </div></Row>
      </Section>

      {msg && (
        <p className={`text-[13px] font-semibold px-4 py-3 rounded-[10px] ${msg.ok ? "bg-success-light text-green-700" : "bg-danger-light text-danger"}`}>
          {msg.text}
        </p>
      )}

      <button onClick={handleSave} disabled={isPending}
        className="btn btn-primary w-fit disabled:opacity-60">
        {isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-6">
      <h3 className="text-[15px] font-black text-secondary mb-4">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-[140px_1fr] gap-4 items-start max-sm:grid-cols-1">{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="form-label pt-2.5">{children}</label>;
}
