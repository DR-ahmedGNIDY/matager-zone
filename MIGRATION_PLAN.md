# Mtajer Zone — HTML to Next.js Migration Plan

## HTML Audit Results

| HTML File | Lines | Description |
|-----------|-------|-------------|
| `index.html` | 2076 | Homepage — Hero, Stats, Categories, Stores, Products, How It Works, Pricing, Testimonials, FAQ, CTA, Footer |
| `stores.html` | 805 | Store Directory — Search, Filters Sidebar, Store Cards Grid/List, Pagination |
| `store.html` | 842 | Individual Store Page — Cover, Profile Bar, Products, About, Reviews, Related Stores |
| `product.html` | 711 | Product Detail — Gallery, Info, Variants, WhatsApp Order, Specs, Reviews, Related |
| `cart.html` | 630 | Cart — Store Group, Items, Coupon, Summary, WhatsApp Checkout |
| `login.html` | 484 | Auth — Login + Register tabs, Google OAuth, Password strength |
| `create-store.html` | 858 | 5-Step Store Wizard — Info, Identity, WhatsApp, Hours, SEO |
| `store-dashboard.html` | 785 | Store Owner Dashboard — Stats, Charts, Orders Table, Products |
| `customer-dashboard.html` | 687 | Customer Dashboard — Orders, Wishlist, Followed Stores, Profile |
| `admin-dashboard.html` | 693 | Admin Panel — Dark theme, Stores, Users, Pending Approval |

---

## Route Mapping: HTML → Next.js App Router

### Public Routes `(public)`

| HTML Page | Next.js Route | Component |
|-----------|--------------|-----------|
| `index.html` | `/` | `app/(public)/page.tsx` |
| `stores.html` | `/stores` | `app/(public)/stores/page.tsx` |
| `store.html` | `/store/[slug]` | `app/(public)/store/[slug]/page.tsx` |
| `product.html` | `/product/[id]` | `app/(public)/product/[id]/page.tsx` |
| `cart.html` | `/cart` | `app/(public)/cart/page.tsx` |

### Auth Routes `(auth)`

| HTML Page | Next.js Route | Component |
|-----------|--------------|-----------|
| `login.html` (login tab) | `/login` | `app/(auth)/login/page.tsx` |
| `login.html` (register tab) | `/register` | `app/(auth)/register/page.tsx` |
| — | `/forgot-password` | `app/(auth)/forgot-password/page.tsx` |
| — | `/reset-password` | `app/(auth)/reset-password/page.tsx` |
| — | `/verify-email` | `app/(auth)/verify-email/page.tsx` |

### Dashboard Routes `(dashboard)`

| HTML Page | Next.js Route | Component |
|-----------|--------------|-----------|
| `customer-dashboard.html` | `/dashboard/customer` | `app/(dashboard)/customer/page.tsx` |
| `customer-dashboard.html` | `/dashboard/customer/orders` | `app/(dashboard)/customer/orders/page.tsx` |
| `customer-dashboard.html` | `/dashboard/customer/wishlist` | `app/(dashboard)/customer/wishlist/page.tsx` |
| `store-dashboard.html` | `/dashboard/store` | `app/(dashboard)/store-owner/page.tsx` |
| `store-dashboard.html` | `/dashboard/store/products` | `app/(dashboard)/store-owner/products/page.tsx` |
| `store-dashboard.html` | `/dashboard/store/orders` | `app/(dashboard)/store-owner/orders/page.tsx` |
| `create-store.html` | `/dashboard/store/create` | `app/(dashboard)/store-owner/create/page.tsx` |
| `admin-dashboard.html` | `/dashboard/admin` | `app/(dashboard)/admin/page.tsx` |
| `admin-dashboard.html` | `/dashboard/admin/stores` | `app/(dashboard)/admin/stores/page.tsx` |
| `admin-dashboard.html` | `/dashboard/admin/users` | `app/(dashboard)/admin/users/page.tsx` |

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | ALL | Auth.js handler |
| `/api/stores` | GET/POST | List/Create stores |
| `/api/stores/[slug]` | GET/PUT/DELETE | Store CRUD |
| `/api/products` | GET/POST | Products |
| `/api/products/[id]` | GET/PUT/DELETE | Product CRUD |
| `/api/cart` | GET/POST/DELETE | Cart management |
| `/api/upload` | POST | Cloudinary upload |
| `/api/reviews` | GET/POST | Reviews |
| `/api/orders` | GET/POST | Orders |
| `/api/admin/stores` | GET/PUT | Admin store management |
| `/api/admin/users` | GET/PUT | Admin user management |

---

## Component Breakdown

### Layout Components
- `Navbar` — sticky nav with search, cart, auth
- `Footer` — links, app buttons, socials
- `MobileNav` — hamburger menu for mobile

### Common Components
- `StoreCard` — grid/list view card
- `ProductCard` — product with discount badge, WA button
- `CategoryCard` — category grid item
- `RatingStars` — star display/input
- `VerifiedBadge` — green verified tag
- `FeaturedBadge` — amber featured tag
- `WaButton` — WhatsApp CTA button
- `PricingCard` — subscription plan card
- `Pagination` — page navigation
- `SearchBar` — search with category filter
- `LoadingSkeleton` — shimmer loading states
- `Toast` — notification system

### Store Components
- `StoreCover` — gradient cover with badges
- `StoreProfileBar` — sticky store info bar
- `StoreInfoSidebar` — hours, location, stats
- `StoreProductsGrid` — filterable product grid

### Auth Components
- `LoginForm` — email/password with validation
- `RegisterForm` — multi-field registration
- `ForgotPasswordForm`
- `ResetPasswordForm`

### Dashboard Components
- `DashboardSidebar` — navigation sidebar
- `StatsCard` — metric cards with trends
- `BarChart` — orders/visits chart
- `DonutChart` — category breakdown
- `OrdersTable` — orders with status select
- `ProductsTable` — products management

---

## Design System → Tailwind Mapping

| CSS Variable | Tailwind Class |
|-------------|---------------|
| `--primary: #4F6BFF` | `bg-primary` / `text-primary` |
| `--secondary: #1E293B` | `bg-secondary` / `text-secondary` |
| `--accent: #F59E0B` | `bg-accent` / `text-accent` |
| `--success: #10B981` | `bg-success` / `text-success` |
| `--danger: #EF4444` | `bg-danger` / `text-danger` |
| `--radius: 16px` | `rounded` |
| `--radius-sm: 10px` | `rounded-sm` |
| `--radius-lg: 24px` | `rounded-lg` |
| `--radius-xl: 32px` | `rounded-xl` |
| `--wa: #25D366` | `bg-wa` / `text-wa` |

---

## Global CSS Variables Preserved

All existing CSS variables from `shared.css` are preserved in:
1. `tailwind.config.ts` — as Tailwind theme extensions
2. `src/app/globals.css` — as CSS custom properties for compatibility

---

## State Management Plan

| State | Solution |
|-------|----------|
| Cart | Zustand store + Server sync |
| Auth Session | Auth.js session |
| Wishlist | Zustand + DB sync |
| UI (modals, toasts) | Zustand |
| Server data | React Server Components + Server Actions |
| Forms | React Hook Form + Zod |

---

## Security Plan

| Layer | Implementation |
|-------|---------------|
| Authentication | Auth.js with JWT |
| Authorization | RBAC middleware + role checks |
| Route protection | `middleware.ts` |
| Input validation | Zod schemas on all server actions |
| Password hashing | bcryptjs |
| Rate limiting | Custom middleware (IP-based) |
| CSRF | Auth.js built-in |
| XSS | Next.js built-in sanitization |

---

## Performance Plan

- Server Components for data fetching (no client-side fetch on page load)
- Image optimization via `next/image` + Cloudinary
- Font optimization via `next/font` (Cairo from Google)
- Static generation for public pages where possible
- Incremental Static Regeneration for store/product pages
- Streaming with Suspense for heavy sections
