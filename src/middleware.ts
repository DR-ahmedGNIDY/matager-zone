// FIX BUG-6: force Node.js runtime — middleware uses Map (not Edge-compatible)
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getIpFromRequest, rateLimitAuth, rateLimitApi } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

// ── Route definitions ─────────────────────────────────────────
const PROTECTED_ROUTES  = ["/dashboard", "/profile", "/cart/checkout"];
const ADMIN_ROUTES      = ["/dashboard/admin"];
// FIX BUG-4: matches actual directory /dashboard/store-owner
const STORE_OWNER_ROUTES = ["/dashboard/store-owner"];
const CUSTOMER_ROUTES   = ["/dashboard/customer"];
const AUTH_ROUTES       = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const RATE_LIMITED_AUTH = ["/api/auth/signin", "/api/auth/callback", "/api/register", "/api/forgot-password", "/api/reset-password"];

function matchesPath(pathname: string, routes: string[]): boolean {
  return routes.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function getDashboard(role: string): string {
  if (role === "ADMIN")       return "/dashboard/admin";
  if (role === "STORE_OWNER") return "/dashboard/store-owner";
  return "/dashboard/customer";
}

// FIX BUG-1: Auth.js v5 wraps the handler and exposes session as request.auth
export default auth(async function middleware(request: NextRequest & { auth: { user?: { id: string; role: string } } | null }) {
  const { pathname } = request.nextUrl;
  // FIX BUG-1: access session via request.auth (injected by auth() wrapper)
  const session = request.auth;
  const user = session?.user;
  const ip = getIpFromRequest(request);

  // ── 1. Rate limit auth APIs ──────────────────────────────
  if (matchesPath(pathname, RATE_LIMITED_AUTH)) {
    const result = rateLimitAuth(ip);
    if (!result.success) {
      return NextResponse.json(
        { error: "طلبات كثيرة. حاول مرة أخرى بعد قليل." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // ── 2. Rate limit all other API routes ───────────────────
  if (pathname.startsWith("/api/") && !matchesPath(pathname, RATE_LIMITED_AUTH)) {
    const result = rateLimitApi(ip);
    if (!result.success) {
      return NextResponse.json({ error: "طلبات كثيرة." }, { status: 429 });
    }
  }

  // ── 3. Logged-in user on auth pages → redirect to dashboard
  if (matchesPath(pathname, AUTH_ROUTES) && user) {
    return NextResponse.redirect(new URL(getDashboard(user.role), request.url));
  }

  // ── 4. Unauthenticated on protected routes → login ───────
  if (matchesPath(pathname, PROTECTED_ROUTES) && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // ── 5. RBAC: Admin only ───────────────────────────────────
  if (matchesPath(pathname, ADMIN_ROUTES)) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // ── 6. RBAC: Store owner ──────────────────────────────────
  if (matchesPath(pathname, STORE_OWNER_ROUTES)) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // Allow CUSTOMER to access the store creation page so they can become STORE_OWNER
    const isCreatePage = pathname === "/dashboard/store-owner/create";
    if (user.role !== "STORE_OWNER" && user.role !== "ADMIN" && !isCreatePage) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // ── 7. RBAC: Customer dashboard ──────────────────────────
  if (matchesPath(pathname, CUSTOMER_ROUTES)) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── 8. Security headers on every response ────────────────
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)" ],
};
