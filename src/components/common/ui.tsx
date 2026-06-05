// ── Breadcrumb ────────────────────────────────────────────────
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem { label: string; href?: string; }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-[13px] text-gray-400 flex-wrap py-2.5">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300 text-xs">›</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors no-underline">{item.label}</Link>
          ) : (
            <span className="text-secondary font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ── Badge ─────────────────────────────────────────────────────
type BadgeVariant = "primary"|"success"|"warning"|"danger"|"neutral"|"verified"|"featured";

export function Badge({ variant = "neutral", children, className }: {
  variant?: BadgeVariant; children: React.ReactNode; className?: string;
}) {
  const styles: Record<BadgeVariant, string> = {
    primary:  "bg-primary-ultra text-primary",
    success:  "bg-success-light text-green-700",
    warning:  "bg-warning-light text-amber-700",
    danger:   "bg-danger-light text-red-700",
    neutral:  "bg-gray-100 text-gray-600",
    verified: "bg-success-light text-green-700",
    featured: "bg-warning-light text-amber-700",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full", styles[variant], className)}>
      {children}
    </span>
  );
}

// ── Pagination ────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1 <= 5 ? i + 1 : (i === 5 ? -1 : totalPages);
    if (page >= totalPages - 3) return i === 0 ? 1 : (i === 1 ? -1 : totalPages - 4 + i);
    return i === 0 ? 1 : i === 1 ? -1 : i <= 5 ? page - 2 + (i - 2) : (i === 5 ? -1 : totalPages);
  });

  const btnBase = "w-[38px] h-[38px] rounded-[10px] border border-gray-200 bg-white font-semibold text-[13px] cursor-pointer transition-all flex items-center justify-center";
  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button className={cn(btnBase, page === 1 && "opacity-40 cursor-not-allowed")}
        onClick={() => page > 1 && onPageChange(page - 1)} disabled={page === 1}>›› السابق</button>
      {pages.map((p, i) =>
        p === -1
          ? <span key={`e${i}`} className="w-[38px] text-center text-gray-400">...</span>
          : <button key={p} onClick={() => onPageChange(p)}
              className={cn(btnBase, p === page && "!bg-primary !border-primary text-white")}>
              {p}
            </button>
      )}
      <button className={cn(btnBase, page === totalPages && "opacity-40 cursor-not-allowed")}
        onClick={() => page < totalPages && onPageChange(page + 1)} disabled={page === totalPages}>التالي ‹‹</button>
    </div>
  );
}

// ── LoadingSkeleton ───────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-[10px] bg-gray-100 animate-pulse", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[16px] border border-gray-100 overflow-hidden">
      <Skeleton className="h-[160px] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
      <Skeleton className="h-[120px] rounded-none" />
      <div className="p-3.5 space-y-2">
        <div className="flex gap-2 items-start">
          <Skeleton className="w-12 h-12 rounded-[10px] flex-shrink-0 -mt-6" />
          <div className="flex-1 space-y-1.5 mt-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────
export function EmptyState({ icon = "📭", title, description, action }: {
  icon?: string; title: string; description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-[18px] font-bold text-secondary mb-2">{title}</h3>
      {description && <p className="text-[14px] text-gray-400 mb-6">{description}</p>}
      {action && (
        <a href={action.href} className="btn btn-primary inline-flex no-underline">{action.label}</a>
      )}
    </div>
  );
}
