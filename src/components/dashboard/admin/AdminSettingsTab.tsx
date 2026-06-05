"use client";
import { useState, useTransition } from "react";
import { updatePlatformSettingsAction } from "@/actions/admin.actions";

interface Settings {
  siteName?: string | null; siteDescription?: string | null;
  supportEmail?: string | null; supportWhatsapp?: string | null;
  maintenanceMode?: boolean; allowRegistration?: boolean;
  requireEmailVerification?: boolean; autoApproveStores?: boolean;
}

interface Props { settings: Settings | null }

export default function AdminSettingsTab({ settings: initial }: Props) {
  const [, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [siteName,   setSiteName]   = useState(initial?.siteName   ?? "متاجر زون");
  const [siteDesc,   setSiteDesc]   = useState(initial?.siteDescription ?? "");
  const [email,      setEmail]      = useState(initial?.supportEmail ?? "");
  const [waNumber,   setWaNumber]   = useState(initial?.supportWhatsapp ?? "");
  const [maintenance,setMaintenance]= useState(initial?.maintenanceMode ?? false);
  const [allowReg,   setAllowReg]   = useState(initial?.allowRegistration ?? true);
  const [requireVerify, setRequireVerify] = useState(initial?.requireEmailVerification ?? true);
  const [autoApprove,   setAutoApprove]   = useState(initial?.autoApproveStores ?? false);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePlatformSettingsAction({
        siteName, siteDescription: siteDesc,
        supportEmail: email || undefined,
        supportWhatsapp: waNumber || undefined,
        maintenanceMode:          maintenance,
        allowRegistration:        allowReg,
        requireEmailVerification: requireVerify,
        autoApproveStores:        autoApprove,
      });
      setMsg({ text: result.success ? "✅ تم حفظ الإعدادات" : result.error ?? "حدث خطأ", ok: result.success });
      setTimeout(() => setMsg(null), 3000);
    });
  };

  return (
    <div className="max-w-lg flex flex-col gap-5">
      <Section title="🌐 معلومات المنصة">
        <Field label="اسم المنصة">
          <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="admin-input" />
        </Field>
        <Field label="وصف المنصة">
          <textarea value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} className="admin-input" rows={2} />
        </Field>
        <Field label="بريد الدعم">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" type="email" dir="ltr" />
        </Field>
        <Field label="واتساب الدعم">
          <input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} className="admin-input" dir="ltr" placeholder="201000000000" />
        </Field>
      </Section>

      <Section title="🔧 إعدادات النظام">
        <Toggle label="وضع الصيانة" desc="إيقاف الموقع مؤقتاً للصيانة" value={maintenance} onChange={setMaintenance} />
        <Toggle label="السماح بالتسجيل" desc="السماح للمستخدمين الجدد بإنشاء حسابات" value={allowReg} onChange={setAllowReg} />
        <Toggle label="تأكيد البريد الإلكتروني" desc="اشتراط تأكيد البريد عند التسجيل" value={requireVerify} onChange={setRequireVerify} />
        <Toggle label="قبول المتاجر تلقائياً" desc="قبول طلبات المتاجر الجديدة بدون مراجعة يدوية" value={autoApprove} onChange={setAutoApprove} />
      </Section>

      {msg && (
        <p className={`text-[13px] font-semibold px-4 py-3 rounded-[12px] ${msg.ok ? "bg-success/20 text-green-400" : "bg-danger/20 text-red-400"}`}>
          {msg.text}
        </p>
      )}

      <button onClick={handleSave} className="btn btn-primary w-fit">حفظ الإعدادات</button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-[16px] border border-white/10 p-5">
      <h3 className="text-[14px] font-black text-white mb-4">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        <div className="text-[13px] font-semibold text-white">{label}</div>
        <div className="text-[11px] text-gray-500">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full relative flex-shrink-0 border-none cursor-pointer transition-colors ${value ? "bg-primary" : "bg-white/20"}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all ${value ? "left-0.5" : "right-0.5"}`} />
      </button>
    </div>
  );
}
