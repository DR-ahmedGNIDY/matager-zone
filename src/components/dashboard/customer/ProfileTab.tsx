"use client";
import { useState, useTransition } from "react";
import { updateProfileAction } from "@/actions/customer.actions";
import { changePasswordAction } from "@/actions/auth.actions";

interface ProfileTabProps {
  user: { id: string; name?: string | null; email: string; phone?: string | null };
}

export default function ProfileTab({ user }: ProfileTabProps) {
  // Profile form
  const [name,       setName]       = useState(user.name  ?? "");
  const [phone,      setPhone]      = useState(user.phone ?? "");
  const [profMsg,    setProfMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [profPending, startProfTransition] = useTransition();

  // Password form
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg,     setPwdMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [pwdPending, startPwdTransition] = useTransition();

  const handleProfileSave = () => {
    startProfTransition(async () => {
      const result = await updateProfileAction({ name, phone });
      setProfMsg({ text: result.success ? "تم حفظ البيانات بنجاح ✅" : result.error ?? "حدث خطأ", ok: result.success });
      setTimeout(() => setProfMsg(null), 3000);
    });
  };

  const handlePasswordChange = () => {
    if (newPwd !== confirmPwd) {
      setPwdMsg({ text: "كلمتا المرور غير متطابقتين", ok: false });
      return;
    }
    startPwdTransition(async () => {
      const result = await changePasswordAction(user.id, {
        currentPassword: currentPwd,
        newPassword: newPwd,
        confirmNewPassword: confirmPwd,
      });
      setPwdMsg({ text: result.success ? "تم تغيير كلمة المرور بنجاح ✅" : result.error ?? "حدث خطأ", ok: !!result.success });
      if (result.success) { setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); }
      setTimeout(() => setPwdMsg(null), 3000);
    });
  };

  return (
    <div>
      <h2 className="text-[22px] font-black text-secondary mb-5">👤 بيانات الحساب</h2>
      <div className="flex flex-col gap-5 max-w-lg">

        {/* Profile card */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-black text-2xl">
              {name?.charAt(0) || "م"}
            </div>
            <div>
              <div className="text-[18px] font-black text-secondary">{name || "المستخدم"}</div>
              <div className="text-[13px] text-gray-400">{user.email}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="form-label">الاسم الكامل *</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
              />
            </div>
            <div>
              <label className="form-label">البريد الإلكتروني</label>
              <input className="form-input opacity-60" value={user.email} disabled />
              <p className="text-[11px] text-gray-400 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
            </div>
            <div>
              <label className="form-label">رقم الهاتف (واتساب)</label>
              <input
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01234567890"
                dir="ltr"
              />
            </div>
            {profMsg && (
              <p className={`text-[13px] font-semibold ${profMsg.ok ? "text-success" : "text-danger"}`}>
                {profMsg.text}
              </p>
            )}
            <button
              onClick={handleProfileSave}
              disabled={profPending}
              className="btn btn-primary w-fit disabled:opacity-60"
            >
              {profPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </div>

        {/* Password card */}
        <div className="bg-white rounded-[24px] border border-gray-100 p-6">
          <h3 className="text-[16px] font-black text-secondary mb-4">🔒 تغيير كلمة المرور</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="form-label">كلمة المرور الحالية</label>
              <input type="password" className="form-input" value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className="form-label">كلمة المرور الجديدة</label>
              <input type="password" className="form-input" value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)} placeholder="8 أحرف على الأقل" />
            </div>
            <div>
              <label className="form-label">تأكيد كلمة المرور الجديدة</label>
              <input type="password" className="form-input" value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)} placeholder="••••••••" />
            </div>
            {pwdMsg && (
              <p className={`text-[13px] font-semibold ${pwdMsg.ok ? "text-success" : "text-danger"}`}>
                {pwdMsg.text}
              </p>
            )}
            <button
              onClick={handlePasswordChange}
              disabled={pwdPending || !currentPwd || !newPwd || !confirmPwd}
              className="btn btn-outline w-fit disabled:opacity-60"
            >
              {pwdPending ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
