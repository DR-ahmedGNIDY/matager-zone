// ═══════════════════════════════════════════════════════════════
// MTAJER ZONE — Application Constants
// ═══════════════════════════════════════════════════════════════

// ── App Info ──────────────────────────────────────────────────
export const APP_NAME = "متاجر زون";
export const APP_NAME_EN = "Mtajer Zone";
export const APP_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "mtajerzone.com";
export const APP_URL    = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const SITE_DOMAIN= process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "mtajerzone.com";
export const OG_IMAGE   = `${APP_URL}/og-image.png`;
export const TWITTER_HANDLE = "@MtajerZone";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@mtajerzone.com";
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "201234567890";

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
export const STORES_PAGE_SIZE = 12;
export const PRODUCTS_PAGE_SIZE = 18;
export const ORDERS_PAGE_SIZE = 20;

// ── Rate Limiting ─────────────────────────────────────────────
export const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const AUTH_RATE_LIMIT_MAX = 10; // stricter for auth

// ── File Upload ───────────────────────────────────────────────
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_PRODUCT_IMAGES = 8;
export const CLOUDINARY_STORE_LOGOS_FOLDER = "mtajer-zone/store-logos";
export const CLOUDINARY_STORE_COVERS_FOLDER = "mtajer-zone/store-covers";
export const CLOUDINARY_PRODUCT_IMAGES_FOLDER = "mtajer-zone/product-images";

// ── Auth ──────────────────────────────────────────────────────
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Platform admin WhatsApp number (for store approval manual flow)
// Store owners contact this number after submitting their application
export const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || "201000000000";
export const EMAIL_VERIFY_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
export const RESET_PASSWORD_EXPIRY = 60 * 60 * 1000; // 1 hour
export const BCRYPT_ROUNDS = 12;

// ── Subscription Plans ────────────────────────────────────────
export const SUBSCRIPTION_PLANS = {
  STARTER: {
    id: "STARTER",
    name: "Starter",
    nameAr: "المبتدئ",
    description: "للبدء بمتجرك الأول",
    monthlyPriceInCents: 19900,
    yearlyPriceInCents: 15900,
    features: [
      "متجر واحد",
      "50 منتج",
      "دعم واتساب",
      "تحديثات أساسية",
    ],
    limits: {
      stores: 1,
      products: 50,
      images: 3,
    },
    color: "gray",
  },
  PROFESSIONAL: {
    id: "PROFESSIONAL",
    name: "Professional",
    nameAr: "المحترف",
    description: "للتجار المحترفين",
    monthlyPriceInCents: 59900,
    yearlyPriceInCents: 47900,
    features: [
      "منتجات غير محدودة",
      "كوبونات خصم",
      "تقارير متقدمة",
      "دعم فني",
      "باج موثوق",
    ],
    limits: {
      stores: 1,
      products: -1, // unlimited
      images: 8,
    },
    color: "primary",
    isPopular: true,
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    nameAr: "المؤسسي",
    description: "متاجر متعددة ومتقدمة",
    monthlyPriceInCents: 149900,
    yearlyPriceInCents: 119900,
    features: [
      "متاجر متعددة",
      "منتجات غير محدودة",
      "إعلانات مميزة",
      "دعم أولوية 24/7",
    ],
    limits: {
      stores: -1, // unlimited
      products: -1,
      images: 8,
    },
    color: "gray",
  },
} as const;

// ── Store Categories ──────────────────────────────────────────
export const STORE_CATEGORIES = [
  { slug: "fashion", nameAr: "أزياء وإكسسوارات", emoji: "👗" },
  { slug: "beauty", nameAr: "جمال وعناية", emoji: "💄" },
  { slug: "electronics", nameAr: "إلكترونيات", emoji: "📱" },
  { slug: "home", nameAr: "أدوات منزلية", emoji: "🛠️" },
  { slug: "cars", nameAr: "سيارات", emoji: "🚗" },
  { slug: "gifts", nameAr: "هدايا", emoji: "🎁" },
  { slug: "food", nameAr: "طعام ومشروبات", emoji: "🍽️" },
  { slug: "books", nameAr: "كتب وتعليم", emoji: "📚" },
  { slug: "sports", nameAr: "رياضة ولياقة", emoji: "⚽" },
] as const;

// ── Countries ─────────────────────────────────────────────────
export const COUNTRIES = [
  { code: "EG", nameAr: "مصر", flag: "🇪🇬", dialCode: "20" },
  { code: "SA", nameAr: "السعودية", flag: "🇸🇦", dialCode: "966" },
  { code: "AE", nameAr: "الإمارات", flag: "🇦🇪", dialCode: "971" },
  { code: "KW", nameAr: "الكويت", flag: "🇰🇼", dialCode: "965" },
  { code: "QA", nameAr: "قطر", flag: "🇶🇦", dialCode: "974" },
  { code: "BH", nameAr: "البحرين", flag: "🇧🇭", dialCode: "973" },
  { code: "OM", nameAr: "عُمان", flag: "🇴🇲", dialCode: "968" },
  { code: "JO", nameAr: "الأردن", flag: "🇯🇴", dialCode: "962" },
  { code: "LB", nameAr: "لبنان", flag: "🇱🇧", dialCode: "961" },
  { code: "MA", nameAr: "المغرب", flag: "🇲🇦", dialCode: "212" },
] as const;

// ── Order Statuses ────────────────────────────────────────────
export const ORDER_STATUS_CONFIG = {
  NEW: {
    label: "جديد",
    emoji: "🆕",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  VIEWED: {
    label: "تم الاطلاع",
    emoji: "👁️",
    color: "bg-warning-light text-amber-700 border-amber-200",
  },
  CONTACTED: {
    label: "تم التواصل",
    emoji: "📞",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  CONFIRMED: {
    label: "مؤكد",
    emoji: "✅",
    color: "bg-success-light text-green-700 border-green-200",
  },
  COMPLETED: {
    label: "مكتمل",
    emoji: "🏁",
    color: "bg-primary-ultra text-primary border-primary/20",
  },
  CANCELLED: {
    label: "ملغي",
    emoji: "❌",
    color: "bg-danger-light text-red-700 border-red-200",
  },
} as const;

// ── Store Statuses ────────────────────────────────────────────
export const STORE_STATUS_CONFIG = {
  PENDING: {
    label: "قيد المراجعة",
    emoji: "⏳",
    color: "bg-warning-light text-amber-700",
  },
  ACTIVE: {
    label: "نشط",
    emoji: "✅",
    color: "bg-success-light text-green-700",
  },
  REJECTED: {
    label: "مرفوض",
    emoji: "❌",
    color: "bg-danger-light text-red-700",
  },
  SUSPENDED: {
    label: "موقوف",
    emoji: "🚫",
    color: "bg-gray-100 text-gray-600",
  },
} as const;

// ── Navigation ────────────────────────────────────────────────
export const PUBLIC_NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/stores", label: "المتاجر" },
  { href: "/stores?category=all", label: "التصنيفات" },
  { href: "/#pricing", label: "الباقات" },
  { href: "/#how", label: "كيف تعمل المنصة؟" },
];

export const CUSTOMER_DASHBOARD_LINKS = [
  { href: "/dashboard/customer", label: "طلباتي", icon: "ShoppingCart", badge: "orders" },
  { href: "/dashboard/customer/wishlist", label: "المفضلة", icon: "Heart" },
  { href: "/dashboard/customer/followed-stores", label: "المتاجر المتابعة", icon: "Store" },
  { href: "/dashboard/customer/notifications", label: "الإشعارات", icon: "Bell", badge: "notifications" },
  { href: "/dashboard/customer/reviews", label: "تقييماتي", icon: "Star" },
  { href: "/dashboard/customer/profile", label: "بيانات الحساب", icon: "User" },
];

export const STORE_OWNER_DASHBOARD_LINKS = [
  { href: "/dashboard/store-owner",          label: "لوحة التحكم",    icon: "LayoutDashboard" },
  { href: "/dashboard/store-owner/products", label: "المنتجات",       icon: "Package" },
  { href: "/dashboard/store-owner/orders",   label: "الطلبات",        icon: "ShoppingCart", badge: "orders" },
  { href: "/dashboard/store-owner/settings", label: "إعدادات المتجر", icon: "Settings" },
];

export const ADMIN_DASHBOARD_LINKS = [
  { href: "/dashboard/admin",          label: "نظرة عامة",    icon: "LayoutDashboard" },
  { href: "/dashboard/admin?tab=stores",  label: "المتاجر",    icon: "Store" },
  { href: "/dashboard/admin?tab=pending", label: "قيد المراجعة", icon: "Clock", badge: "pending" },
  { href: "/dashboard/admin?tab=users",   label: "المستخدمون", icon: "Users" },
];

// ── Cover gradient options ────────────────────────────────────
export const COVER_GRADIENTS = [
  "linear-gradient(135deg,#667EEA,#764BA2)",
  "linear-gradient(135deg,#F093FB,#F5576C)",
  "linear-gradient(135deg,#4FACFE,#00F2FE)",
  "linear-gradient(135deg,#43E97B,#38F9D7)",
  "linear-gradient(135deg,#FA709A,#FEE140)",
  "linear-gradient(135deg,#A18CD1,#FBC2EB)",
  "linear-gradient(135deg,#FCCB90,#D57EEB)",
  "linear-gradient(135deg,#a1c4fd,#c2e9fb)",
  "linear-gradient(135deg,#fd7043,#ff8a65)",
] as const;

export const PRIMARY_COLORS = [
  "#4F6BFF",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#1E293B",
] as const;
