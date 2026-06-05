"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, Heart, Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV_LINKS, APP_NAME } from "@/lib/constants";

// Logo component — SVG matching original design
function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M50 5C30.67 5 15 20.67 15 40C15 58 37 78 50 95C63 78 85 58 85 40C85 20.67 69.33 5 50 5Z" fill="#4F6BFF"/>
      <path d="M50 15C50 15 35 30 35 45C35 48 38 50 40 50L44 50L44 65L56 65L56 50L60 50C62 50 65 48 65 45C65 30 50 15 50 15Z" fill="white"/>
      <path d="M44 30L44 50L56 50L56 30L50 22Z" fill="white"/>
    </svg>
  );
}

interface NavbarProps {
  cartCount?: number;
  session?: { user?: { id: string; name?: string | null; role: string } } | null;
}

export default function Navbar({ cartCount = 0, session }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = `/stores?search=${encodeURIComponent(searchValue.trim())}`;
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-white py-2.5 overflow-hidden relative">
        <div className="flex gap-16 w-max" style={{ animation: "scroll-rtl 30s linear infinite" }}>
          {[
            "🎉 أنشئ متجرك الآن وابدأ البيع مجاناً لمدة 14 يوم",
            "⭐ أكثر من 500 متجر نشط على المنصة",
            "📦 50,000 منتج متاح للتسوق",
            "💬 الطلبات تصل مباشرة عبر واتساب",
            "🎉 أنشئ متجرك الآن وابدأ البيع مجاناً لمدة 14 يوم",
            "⭐ أكثر من 500 متجر نشط على المنصة",
            "📦 50,000 منتج متاح للتسوق",
            "💬 الطلبات تصل مباشرة عبر واتساب",
          ].map((text, i) => (
            <span key={i} className="text-xs font-semibold whitespace-nowrap">{text}</span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={cn(
          "sticky top-0 z-[500] transition-all duration-200",
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
            : "bg-white/93 backdrop-blur-xl border-b border-gray-100"
        )}
      >
        <div className="max-w-[1280px] mx-auto px-6 flex items-center gap-4 h-[68px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 no-underline">
            <LogoIcon size={40} />
            <div className="leading-none">
              <div className="text-sm font-black text-primary leading-none">Mtajer Zone</div>
              <div className="text-[11px] font-semibold text-gray-400 leading-none mt-0.5">متاجر زون</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-0.5 list-none m-0 p-0">
            {PUBLIC_NAV_LINKS.map((link) => (
              <li key={link.href} className="list-none">
                <Link
                  href={link.href}
                  className={cn(
                    "text-[13px] font-semibold px-3 py-2 rounded-[10px] transition-all duration-200 no-underline block whitespace-nowrap",
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]))
                      ? "bg-primary-ultra text-primary"
                      : "text-gray-600 hover:bg-primary-ultra hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[320px] relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="ابحث عن منتجات أو متاجر..."
              className="w-full bg-gray-100 border border-transparent rounded-[10px] py-2.5 pr-3.5 pl-8 text-[13px] text-secondary outline-none transition-all focus:border-primary focus:bg-white placeholder:text-gray-400"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 mr-auto lg:mr-0">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative w-[38px] h-[38px] flex items-center justify-center rounded-[10px] bg-gray-100 text-gray-600 hover:bg-primary-ultra hover:text-primary transition-all no-underline"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              href={session ? "/dashboard/customer/wishlist" : "/login"}
              className="w-[38px] h-[38px] flex items-center justify-center rounded-[10px] bg-gray-100 text-gray-600 hover:bg-primary-ultra hover:text-primary transition-all no-underline"
            >
              <Heart className="w-4 h-4" />
            </Link>

            {/* Auth buttons */}
            {session?.user ? (
              <Link
                href={session.user.role === "ADMIN" ? "/dashboard/admin" : session.user.role === "STORE_OWNER" ? "/dashboard/store-owner" : "/dashboard/customer"}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-primary-ultra text-secondary hover:text-primary rounded-[10px] text-[13px] font-bold transition-all no-underline"
              >
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  {(session.user.name || "م").charAt(0)}
                </div>
                <span className="hidden md:block">{session.user.name?.split(" ")[0] || "حسابي"}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:flex items-center px-4 py-2 bg-white border border-gray-200 hover:border-primary hover:text-primary text-secondary rounded-[10px] text-[13px] font-bold transition-all no-underline"
                >
                  دخول
                </Link>
                <Link
                  href="/dashboard/store-owner/create"
                  className="hidden sm:flex items-center px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-[10px] text-[13px] font-bold transition-all shadow-primary no-underline"
                >
                  افتح متجرك
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden w-[38px] h-[38px] flex items-center justify-center rounded-[10px] bg-gray-100 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="ابحث..."
                className="w-full bg-gray-100 border border-transparent rounded-[10px] py-2.5 pr-3.5 pl-8 text-[13px] outline-none focus:border-primary focus:bg-white"
              />
            </form>
            <ul className="flex flex-col gap-1 list-none m-0 p-0">
              {PUBLIC_NAV_LINKS.map((link) => (
                <li key={link.href} className="list-none">
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-[10px] text-[14px] font-semibold text-gray-600 hover:bg-primary-ultra hover:text-primary transition-all no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {!session?.user && (
              <div className="flex gap-2 mt-4">
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 border border-gray-200 rounded-[10px] text-sm font-bold text-secondary no-underline">
                  دخول
                </Link>
                <Link href="/dashboard/store-owner/create" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 bg-primary text-white rounded-[10px] text-sm font-bold no-underline">
                  افتح متجرك
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
