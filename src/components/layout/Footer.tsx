import Link from "next/link";

function LogoIconWhite({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M50 5C30.67 5 15 20.67 15 40C15 58 37 78 50 95C63 78 85 58 85 40C85 20.67 69.33 5 50 5Z" fill="rgba(255,255,255,0.9)"/>
      <path d="M50 15L35 45L44 45L44 65L56 65L56 45L65 45Z" fill="#4F6BFF"/>
    </svg>
  );
}

const FOOTER_LINKS = {
  quick: [
    { href: "/",             label: "الرئيسية" },
    { href: "/stores",       label: "المتاجر" },
    { href: "/stores",       label: "التصنيفات" },
    { href: "/#pricing",     label: "الباقات" },
    { href: "/#faq",         label: "اتصل بنا" },
  ],
  help: [
    { href: "/#faq",         label: "الأسئلة الشائعة" },
    { href: "/privacy",      label: "سياسة الخصوصية" },
    { href: "/terms",        label: "الشروط والأحكام" },
    { href: "/contact",      label: "اتصل بنا" },
  ],
  about: [
    { href: "/about",        label: "من نحن" },
    { href: "/blog",         label: "المدونة" },
    { href: "/partnerships", label: "الشراكات" },
    { href: "/careers",      label: "وظائف" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 no-underline mb-4">
              <LogoIconWhite size={40} />
              <div className="leading-none">
                <div className="text-sm font-black text-white">Mtajer Zone</div>
                <div className="text-[11px] text-white/50 mt-0.5">متاجر زون</div>
              </div>
            </Link>
            <p className="text-[14px] text-white/60 leading-relaxed mb-6 max-w-[280px]">
              منصة متكاملة لإنشاء وإدارة المتاجر الإلكترونية. ساعد التجار على الوصول لعملاء جدد عبر واتساب كوميرس.
            </p>
            {/* App store buttons */}
            <div className="flex gap-2.5">
              <a href="#" className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-[10px] px-3 py-2 hover:bg-white/15 transition-all no-underline">
                <span className="text-lg">🍎</span>
                <div className="leading-none">
                  <div className="text-[9px] text-white/60">متاح على</div>
                  <div className="text-xs font-bold text-white">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-[10px] px-3 py-2 hover:bg-white/15 transition-all no-underline">
                <span className="text-lg">▶</span>
                <div className="leading-none">
                  <div className="text-[9px] text-white/60">حمّل من</div>
                  <div className="text-xs font-bold text-white">Google Play</div>
                </div>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[15px] font-bold text-white mb-5">روابط سريعة</h4>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {FOOTER_LINKS.quick.map((link) => (
                <li key={link.href + link.label} className="list-none">
                  <Link href={link.href} className="text-[13px] text-white/60 hover:text-white transition-all no-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[15px] font-bold text-white mb-5">مساعدة</h4>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.href + link.label} className="list-none">
                  <Link href={link.href} className="text-[13px] text-white/60 hover:text-white transition-all no-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[15px] font-bold text-white mb-5">من متاجر زون</h4>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {FOOTER_LINKS.about.map((link) => (
                <li key={link.href + link.label} className="list-none">
                  <Link href={link.href} className="text-[13px] text-white/60 hover:text-white transition-all no-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 mt-8">
          <p className="text-[13px] text-white/40">
            © {new Date().getFullYear()} متاجر زون. جميع الحقوق محفوظة.
          </p>
          {/* Social links */}
          <div className="flex gap-2.5">
            {[
              { icon: "📸", label: "Instagram", href: "#" },
              { icon: "🎵", label: "TikTok",    href: "#" },
              { icon: "▶",  label: "YouTube",   href: "#" },
              { icon: "👤", label: "Facebook",  href: "#" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 bg-white/10 rounded-[8px] flex items-center justify-center text-base hover:bg-primary transition-all no-underline"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
