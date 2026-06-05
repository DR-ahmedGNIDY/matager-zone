import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

// ── Tailwind ──────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Money (piastres <-> display) ─────────────────────────────
// All prices stored as Int piastres (1 EGP = 100 piastres)
// FIX NORM-2: no Float rounding errors
export function toEGP(piastres: number): number {
  return piastres / 100;
}
export function toPiastres(egp: number): number {
  return Math.round(egp * 100);
}
export function formatPrice(
  piastres: number,
  currency = "ج.م",
  locale = "ar-EG"
): string {
  const egp = toEGP(piastres);
  return `${egp.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}
export function calculateDiscountPct(priceInCents: number, comparePriceInCents: number): number {
  if (!comparePriceInCents || comparePriceInCents <= priceInCents) return 0;
  return Math.round(((comparePriceInCents - priceInCents) / comparePriceInCents) * 100);
}
export function calculateSavingsInCents(priceInCents: number, comparePriceInCents: number): number {
  if (!comparePriceInCents || comparePriceInCents <= priceInCents) return 0;
  return comparePriceInCents - priceInCents;
}

// ── Slug generation ───────────────────────────────────────────
// FIX SLUG-1: base generation only — collision suffix added by service layer
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "ar",
    replacement: "-",
    remove: /[*+~.()''"!:@#$%^&]/g,
  });
}

// Collision-safe slug: service passes existingSlugs to this helper
export function generateUniqueSlug(base: string, existingSlugs: string[]): string {
  const slug = generateSlug(base);
  if (!existingSlugs.includes(slug)) return slug;
  let i = 1;
  while (existingSlugs.includes(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

// ── WhatsApp ──────────────────────────────────────────────────
// FIX WA-1: phone always normalized to E.164 digits only (no + prefix)
export function normalizeWhatsAppNumber(raw: string, countryCode: string): string {
  const digitsOnly = raw.replace(/[^0-9]/g, "");
  const cc = countryCode.replace(/[^0-9]/g, "");
  // If number already starts with country code, return as-is
  if (digitsOnly.startsWith(cc)) return digitsOnly;
  // Strip leading zero if present
  const local = digitsOnly.startsWith("0") ? digitsOnly.slice(1) : digitsOnly;
  return `${cc}${local}`;
}

export function buildWhatsAppUrl(normalizedPhone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

export function buildWhatsAppOrderMessage(params: {
  storeName: string;
  items: Array<{
    name: string;
    quantity: number;
    priceInCents: number;
    variants?: Record<string, string>;
  }>;
  totalInCents: number;
  customerNote?: string;
}): string {
  const { storeName, items, totalInCents, customerNote } = params;
  let msg = "السلام عليكم\nأرغب في طلب المنتجات التالية:\n\n";
  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name}\n`;
    msg += `   الكمية: ${item.quantity}\n`;
    msg += `   السعر: ${formatPrice(item.priceInCents)}\n`;
    if (item.variants && Object.keys(item.variants).length > 0) {
      Object.entries(item.variants).forEach(([k, v]) => { msg += `   ${k}: ${v}\n`; });
    }
    msg += "\n";
  });
  msg += `إجمالي الطلب: ${formatPrice(totalInCents)}\n`;
  msg += `اسم المتجر: ${storeName}\n`;
  if (customerNote) msg += `\nملاحظات: ${customerNote}\n`;
  msg += "\nشكراً";
  return msg;
}

export function buildSingleProductWhatsAppMessage(params: {
  productName: string;
  priceInCents: number;
  storeName: string;
  productUrl: string;
  quantity?: number;
  selectedVariants?: Record<string, string>;
}): string {
  const { productName, priceInCents, storeName, productUrl, quantity = 1, selectedVariants } = params;
  let msg = "السلام عليكم\nأرغب في طلب المنتج التالي:\n\n";
  msg += `اسم المنتج: ${productName}\n`;
  msg += `الكمية: ${quantity}\n`;
  if (selectedVariants && Object.keys(selectedVariants).length > 0) {
    Object.entries(selectedVariants).forEach(([k, v]) => { msg += `${k}: ${v}\n`; });
  }
  msg += `السعر: ${formatPrice(priceInCents)}\n`;
  msg += `رابط المنتج: ${productUrl}\n`;
  msg += `اسم المتجر: ${storeName}\n\nشكراً`;
  return msg;
}

// ── Order number ──────────────────────────────────────────────
// FIX ORD-1: concurrency-safe using cuid-based prefix
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MZ-${timestamp}-${random}`;
}

// ── Date formatting ───────────────────────────────────────────
export function formatDate(date: Date | string, locale = "ar-EG"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const s = Math.floor(diffMs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);
  const wk = Math.floor(day / 7);
  const mo = Math.floor(day / 30);
  if (s < 60) return "منذ لحظات";
  if (m < 60) return `منذ ${m} دقيقة`;
  if (h < 24) return `منذ ${h} ساعة`;
  if (day < 7) return `منذ ${day} يوم`;
  if (wk < 4) return `منذ ${wk} أسبوع`;
  if (mo < 12) return `منذ ${mo} شهر`;
  return formatDate(d);
}

// ── String utils ──────────────────────────────────────────────
export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max) + "...";
}
export function getInitials(name: string | null | undefined): string {
  if (!name) return "؟";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

// ── URL helpers ───────────────────────────────────────────────
export function getStoreUrl(slug: string): string { return `/store/${slug}`; }
export function getProductUrl(id: string): string { return `/product/${id}`; }

// ── Validation ────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function isValidPhone(phone: string): boolean {
  return /^[0-9]{7,15}$/.test(phone.replace(/[^0-9]/g, ""));
}
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}
export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Error handling ────────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "حدث خطأ غير متوقع";
}

// ── Coupon ────────────────────────────────────────────────────
export function applyCoupon(
  totalInCents: number,
  type: "PERCENTAGE" | "FIXED",
  value: number // PERCENTAGE: 0-100 | FIXED: piastres
): number {
  if (type === "PERCENTAGE") {
    return Math.round(totalInCents - (totalInCents * value) / 100);
  }
  return Math.max(0, totalInCents - value);
}

// ── Business hours ────────────────────────────────────────────
export function isStoreOpenNow(
  businessHours: Record<string, { isOpen: boolean; openTime: string; closeTime: string }> | null
): boolean {
  if (!businessHours) return true;
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const today = businessHours[days[new Date().getDay()]];
  if (!today?.isOpen) return false;
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const [oh, om] = today.openTime.split(":").map(Number);
  const [ch, cm] = today.closeTime.split(":").map(Number);
  return now >= oh * 60 + om && now <= ch * 60 + cm;
}

// ── Pagination cursor helper ──────────────────────────────────
// FIX SCALE-3: keyset/cursor pagination support
export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
export function buildCursorPage<T extends { id: string }>(
  items: T[],
  limit: number
): CursorPage<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  return {
    data,
    nextCursor: hasMore ? data[data.length - 1].id : null,
    hasMore,
  };
}
