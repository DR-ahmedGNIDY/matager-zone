import nodemailer from "nodemailer";
import { APP_NAME, APP_URL } from "./constants";

// ── Transporter ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || `${APP_NAME} <noreply@mtajerzone.com>`;

// ── Base HTML template ────────────────────────────────────────
function emailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',Arial,sans-serif; background:#F8FAFC; direction:rtl; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08); }
    .header { background:linear-gradient(135deg,#4F6BFF,#6B83FF); padding:32px 40px; text-align:center; }
    .header h1 { color:#fff; font-size:24px; font-weight:900; margin-top:12px; }
    .header p { color:rgba(255,255,255,.8); font-size:14px; margin-top:4px; }
    .body { padding:40px; }
    .body h2 { font-size:20px; font-weight:800; color:#1E293B; margin-bottom:12px; }
    .body p { font-size:14px; color:#475569; line-height:1.8; margin-bottom:16px; }
    .btn { display:inline-block; background:#4F6BFF; color:#fff; padding:14px 32px; border-radius:10px; font-size:15px; font-weight:700; text-decoration:none; margin:16px 0; }
    .code { background:#EEF1FF; border-radius:10px; padding:20px; text-align:center; margin:20px 0; }
    .code span { font-size:32px; font-weight:900; color:#4F6BFF; letter-spacing:8px; }
    .footer { padding:24px 40px; border-top:1px solid #E2E8F0; text-align:center; }
    .footer p { font-size:12px; color:#94A3B8; }
    .footer a { color:#4F6BFF; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div style="font-size:40px;">🛍️</div>
      <h1>${APP_NAME}</h1>
      <p>منصة إنشاء وإدارة المتاجر الرقمية</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>هذا البريد أُرسل تلقائياً من ${APP_NAME}. لا تتجاوب مع هذا البريد.</p>
      <p style="margin-top:8px;"><a href="${APP_URL}">${APP_URL}</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ── Email senders ─────────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `✅ تأكيد البريد الإلكتروني — ${APP_NAME}`,
    html: emailTemplate(`
      <h2>مرحباً ${name}! 👋</h2>
      <p>شكراً لتسجيلك في ${APP_NAME}. يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه.</p>
      <div style="text-align:center;">
        <a href="${verifyUrl}" class="btn">تأكيد البريد الإلكتروني</a>
      </div>
      <p style="font-size:12px;color:#94A3B8;">
        إذا لم تنشئ حساباً، يمكنك تجاهل هذا البريد.<br>
        ينتهي هذا الرابط خلال 24 ساعة.
      </p>
    `),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `🔒 إعادة تعيين كلمة المرور — ${APP_NAME}`,
    html: emailTemplate(`
      <h2>إعادة تعيين كلمة المرور</h2>
      <p>مرحباً ${name}، تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
      <div style="text-align:center;">
        <a href="${resetUrl}" class="btn">إعادة تعيين كلمة المرور</a>
      </div>
      <p style="font-size:12px;color:#94A3B8;">
        إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذا البريد.<br>
        ينتهي هذا الرابط خلال ساعة واحدة.
      </p>
    `),
  });
}

export async function sendStoreApprovedEmail(
  email: string,
  storeName: string,
  storeSlug: string
): Promise<void> {
  const storeUrl = `${APP_URL}/store/${storeSlug}`;
  const dashboardUrl = `${APP_URL}/dashboard/store-owner`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `🎉 تم تفعيل متجرك "${storeName}" — ${APP_NAME}`,
    html: emailTemplate(`
      <h2>🎉 تهانينا! تم تفعيل متجرك</h2>
      <p>يسعدنا إخبارك بأن متجرك <strong>${storeName}</strong> قد تمت مراجعته وتفعيله بنجاح على منصة ${APP_NAME}.</p>
      <p>الآن يمكنك البدء في إضافة منتجاتك واستقبال الطلبات عبر واتساب.</p>
      <div style="text-align:center;margin:20px 0;">
        <a href="${dashboardUrl}" class="btn" style="margin-left:12px;">لوحة التحكم</a>
        <a href="${storeUrl}" class="btn" style="background:#25D366;">معاينة المتجر</a>
      </div>
    `),
  });
}

export async function sendStoreRejectedEmail(
  email: string,
  storeName: string,
  reason?: string
): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `❌ تم رفض طلب متجرك "${storeName}" — ${APP_NAME}`,
    html: emailTemplate(`
      <h2>نأسف لإبلاغك...</h2>
      <p>تم مراجعة طلب متجرك <strong>${storeName}</strong> ولم نتمكن من الموافقة عليه في الوقت الحالي.</p>
      ${reason ? `<p><strong>السبب:</strong> ${reason}</p>` : ""}
      <p>يمكنك مراجعة بيانات متجرك وإعادة التقديم. للمساعدة، تواصل مع فريق الدعم.</p>
    `),
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `👋 مرحباً بك في ${APP_NAME}`,
    html: emailTemplate(`
      <h2>أهلاً وسهلاً ${name}! 🎉</h2>
      <p>يسعدنا انضمامك إلى ${APP_NAME}، منصة إنشاء وإدارة المتاجر الرقمية.</p>
      <p>يمكنك الآن:</p>
      <ul style="margin:12px 0 20px 0;padding-right:20px;line-height:2;">
        <li>إنشاء متجرك الإلكتروني في دقائق</li>
        <li>إضافة منتجاتك بسهولة</li>
        <li>استقبال الطلبات مباشرة عبر واتساب</li>
        <li>متابعة تحليلات متجرك</li>
      </ul>
      <div style="text-align:center;">
        <a href="${APP_URL}/dashboard/store-owner/create" class="btn">افتح متجرك الآن</a>
      </div>
    `),
  });
}
