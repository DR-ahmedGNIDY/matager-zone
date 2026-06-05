"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarLink {
  href: string; label: string; icon: string; badge?: number;
}

interface DashboardSidebarProps {
  links: SidebarLink[];
  user: { name?: string | null; email: string; image?: string | null; role: string };
  storeName?: string;
  storePlan?: string;
  variant?: "customer" | "store" | "admin";
}

export default function DashboardSidebar({ links, user, storeName, storePlan, variant = "customer" }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "flex flex-col min-h-full",
      variant === "admin" ? "bg-[#0F172A] text-white" : "bg-[#1E293B] text-white"
    )}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center text-white font-black text-sm">Z</div>
          <div className="leading-none">
            <div className="text-sm font-black text-white">Mtajer Zone</div>
            <div className="text-[10px] text-white/50 mt-0.5">متاجر زون</div>
          </div>
        </Link>
        {variant === "admin" && (
          <span className="inline-block mt-2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded">ADMIN</span>
        )}
      </div>

      {/* Store info (store owner only) */}
      {variant === "store" && storeName && (
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/10 rounded-[10px] flex items-center justify-center text-lg">🏪</div>
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-white truncate">{storeName}</div>
              <div className="text-[11px] text-white/50">{storePlan ? `⭐ باقة ${storePlan}` : "متجر نشط"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Customer profile (customer only) */}
      {variant === "customer" && (
        <div className="px-5 py-4 border-b border-white/10 text-center">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-black text-xl mx-auto mb-2">
            {user.name?.charAt(0) || "م"}
          </div>
          <div className="text-[14px] font-bold text-white">{user.name || "المستخدم"}</div>
          <div className="text-[11px] text-white/50 truncate">{user.email}</div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 text-[13px] font-semibold transition-all no-underline",
                active
                  ? "bg-primary text-white"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              )}
            >
              <span className="text-base w-5 text-center">{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {link.badge && link.badge > 0 && (
                <span className="bg-danger text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {link.badge > 9 ? "9+" : link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section bottom */}
      <div className="px-5 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
          {user.name?.charAt(0) || "م"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-white/80 truncate">{user.name || "المستخدم"}</div>
          <div className="text-[10px] text-white/40 truncate">{user.email}</div>
        </div>
        <Link href="/api/auth/signout" className="text-white/40 hover:text-white transition-colors text-xs no-underline">خروج</Link>
      </div>
    </aside>
  );
}
