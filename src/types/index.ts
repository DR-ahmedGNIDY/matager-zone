// ═══════════════════════════════════════════════════════════════
// MTAJER ZONE — TypeScript Types
// ═══════════════════════════════════════════════════════════════

// ── ENUMS ────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "STORE_OWNER" | "CUSTOMER";

export type StoreStatus = "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";

export type ProductStatus = "ACTIVE" | "HIDDEN" | "ARCHIVED";

export type OrderStatus =
  | "NEW"
  | "VIEWED"
  | "CONTACTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type SubscriptionPlan = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

// ── USER ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: UserRole;
  isOwner: boolean;
  phone: string | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  isOwner: boolean;
}

// ── STORE ────────────────────────────────────────────────────────

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  cover: string | null;
  whatsappNumber: string;  // E.164 digits only, no + prefix
  countryCode: string;
  address: string | null;
  country: string | null;
  city: string | null;
  status: StoreStatus;
  isVerified: boolean;
  isFeatured: boolean;
  primaryColor: string;
  welcomeMessage: string | null;
  orderButtonText: string;
  seoTitle: string | null;
  seoDescription: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  businessHours: BusinessHours | null;
  ownerId: string;
  categoryId: string | null;
  category: StoreCategory | null;
  owner: Pick<User, "id" | "name" | "email">;
  subscription: StoreSubscription | null;
  _count?: {
    products: number;
    reviews: number;
    followers: number;
    orders: number;
  };
  averageRating?: number;
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreCategory {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  slug: string;
  storeCount?: number;
}

export interface BusinessHours {
  saturday: DayHours;
  sunday: DayHours;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface StoreSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
}

// ── PRODUCT ──────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;      // stored as Int (piastres)
  comparePriceInCents: number | null;
  sku: string | null;
  stock: number | null;
  trackStock: boolean;
  status: ProductStatus;
  isFeatured: boolean;
  tags: string[];
  variants: ProductVariant[];
  storeId: string;
  store: Pick<Store, "id" | "name" | "slug" | "whatsappNumber" | "countryCode">;
  categoryId: string | null;
  category: ProductCategory | null;
  images: ProductImage[];
  _count?: { reviews: number };
  averageRating?: number;
  seoTitle: string | null;
  seoDescription: string | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  storeId: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductWithDiscount extends Product {
  discountPercent: number | null;
  savings: number | null;
}

// ── CART ─────────────────────────────────────────────────────────

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  storeId: string | null;
  store: Pick<Store, "id" | "name" | "slug" | "whatsappNumber" | "countryCode"> | null;
  items: CartItem[];
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>;
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  couponDiscount: number;
  total: number;
  itemCount: number;
}

// ── WISHLIST ──────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
}

// ── ORDER ─────────────────────────────────────────────────────────

export interface Order {
  id: string;
  orderNumber: string;   // format: MZ-{timestamp}-{random}
  status: OrderStatus;
  customerId: string | null;
  storeId: string;
  store: Pick<Store, "id" | "name" | "slug" | "whatsappNumber" | "countryCode">;
  items: OrderItem[];
  whatsappMessage: string;
  notes: string | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Pick<Product, "id" | "name" | "priceInCents" | "images">;
  quantity: number;
  priceInCents: number;      // stored as Int (piastres)
  selectedVariants: Record<string, string>;
}

// ── REVIEW ────────────────────────────────────────────────────────

export type ReviewType = "STORE" | "PRODUCT";

export interface Review {
  id: string;
  reviewType: ReviewType;
  rating: number;
  comment: string | null;
  userId: string;
  user: Pick<User, "id" | "name" | "image">;
  storeId: string | null;
  productId: string | null;
  isApproved: boolean;
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
}

// ── NOTIFICATION ──────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "ORDER" | "REVIEW" | "STORE" | "SYSTEM" | "PROMOTION";
  isRead: boolean;
  link: string | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
}

// ── AUDIT LOG ────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  user: Pick<User, "id" | "name" | "email">;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
}

// ── PLATFORM SETTINGS ────────────────────────────────────────────

export interface PlatformSettings {
  id: string;
  siteName: string;
  siteNameAr: string;
  siteDescription: string | null;
  logo: string | null;
  favicon: string | null;
  supportEmail: string | null;
  supportWhatsapp: string | null;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  starterPrice: number;
  professionalPrice: number;
  enterprisePrice: number;
  updatedAt: Date;
}

// ── API RESPONSE TYPES ───────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ── FILTER TYPES ─────────────────────────────────────────────────

export interface StoreFilters {
  search?: string;
  categorySlug?: string;
  country?: string;
  city?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  minRating?: number;
  sortBy?: "popular" | "rating" | "newest" | "mostProducts";
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  search?: string;
  storeId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
}

// ── DASHBOARD STATS ───────────────────────────────────────────────

export interface StoreDashboardStats {
  totalVisits: number;
  visitsChange: number;
  totalOrders: number;
  ordersChange: number;
  averageRating: number;
  ratingChange: number;
  totalFollowers: number;
  followersChange: number;
  totalProducts: number;
  newOrders: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  usersChange: number;
  totalStores: number;
  storesChange: number;
  totalProducts: number;
  productsChange: number;
  pendingStores: number;
  activeStores: number;
  totalRevenue: number;
  revenueChange: number;
}

// ── WHATSAPP ──────────────────────────────────────────────────────

export interface WhatsAppOrderMessage {
  storeName: string;
  whatsappNumber: string;  // E.164 digits only, no + prefix
  countryCode: string;
  items: Array<{
    name: string;
    quantity: number;
    priceInCents: number;      // stored as Int (piastres)
    variants?: Record<string, string>;
  }>;
  total: number;
  customerNote?: string;
}

// ── FORM TYPES ────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface CreateStoreFormData {
  name: string;
  description: string;
  categoryId: string;
  country: string;
  city: string;
  address: string;
  logo?: File;
  cover?: File;
  primaryColor: string;
  whatsappNumber: string;  // E.164 digits only, no + prefix
  countryCode: string;
  welcomeMessage: string;
  orderButtonText: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  businessHours: BusinessHours;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CreateProductFormData {
  name: string;
  description?: string;
  priceInCents: number;      // stored as Int (piastres)
  comparePrice?: number;
  sku?: string;
  stock?: number;
  trackStock: boolean;
  categoryId?: string;
  tags: string[];
  variants: ProductVariant[];
  images: File[];
  status: ProductStatus;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

// Note: Next-Auth type augmentation is in src/types/next-auth.d.ts

export type NotificationType = "ORDER" | "REVIEW" | "STORE" | "SYSTEM" | "PROMOTION" | "FOLLOW";
