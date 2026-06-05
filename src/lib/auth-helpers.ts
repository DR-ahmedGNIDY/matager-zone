import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

// ── Get session (server component / server action) ────────────
export async function getSession() {
  return await auth();
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

// ── Require auth — redirects if not logged in ─────────────────
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

// ── Require specific role ─────────────────────────────────────
export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role as UserRole)) redirect("/unauthorized");
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireStoreOwner() {
  return requireRole(["STORE_OWNER", "ADMIN"]);
}

export async function requireCustomer() {
  return requireRole(["CUSTOMER", "STORE_OWNER", "ADMIN"]);
}

// ── Check ownership of a store ────────────────────────────────
export async function requireStoreOwnership(storeId: string) {
  const user = await requireStoreOwner();

  if (user.role === "ADMIN") return user; // admin can access any store

  const { db } = await import("@/lib/db");
  const store = await db.store.findFirst({
    where: { id: storeId, ownerId: user.id, deletedAt: null },
    select: { id: true },
  });

  if (!store) redirect("/unauthorized");
  return user;
}

// ── Boolean checks (no redirect) ─────────────────────────────
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  const allowed = Array.isArray(role) ? role : [role];
  return allowed.includes(session.user.role as UserRole);
}

export async function isAdmin(): Promise<boolean> {
  return hasRole("ADMIN");
}

export async function isStoreOwner(): Promise<boolean> {
  return hasRole(["STORE_OWNER", "ADMIN"]);
}
