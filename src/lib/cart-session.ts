import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const CART_SESSION_COOKIE = "mz_cart_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Get the guest cart session ID from cookies.
 * Creates one if it doesn't exist (only call from Server Actions / Route Handlers).
 */
export async function getOrCreateCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE);
  if (existing?.value) return existing.value;

  const sessionId = uuidv4();
  cookieStore.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return sessionId;
}

/**
 * Read the cart session ID from cookies (read-only — no creation).
 */
export async function getCartSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;
}

/**
 * Clear the cart session cookie (on logout or cart merge).
 */
export async function clearCartSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_SESSION_COOKIE);
}
