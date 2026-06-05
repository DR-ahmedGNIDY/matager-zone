/**
 * RATE LIMITING — PRODUCTION NOTES
 * ══════════════════════════════════════════════════════════
 *
 * Current implementation: In-memory Map (Node.js)
 *
 * ✅ Works correctly in DEVELOPMENT and single-instance production
 * ✅ Survives within a single PM2 process instance
 * ❌ DOES NOT survive PM2 restarts (state is lost on restart)
 * ❌ DOES NOT work across multiple PM2 cluster instances
 *
 * For single-server VPS deployment (this project):
 *   → PM2 runs ONE instance → in-memory is acceptable
 *   → Brute-force is ALSO protected at DB level (loginAttempts + lockedUntil)
 *     which DOES survive restarts — this is the primary defense
 *   → In-memory rate limit is a secondary, first-line defense
 *
 * For true production scale (multi-instance):
 *   → Replace with Upstash Redis:
 *     import { Ratelimit } from "@upstash/ratelimit";
 *     import { Redis } from "@upstash/redis";
 *
 * ══════════════════════════════════════════════════════════
 */

import { NextRequest } from "next/server";
import { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX_REQUESTS, AUTH_RATE_LIMIT_MAX } from "./constants";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

function createStore() {
  const map = new Map<string, RateLimitEntry>();

  function cleanup() {
    const now = Date.now();
    for (const [k, v] of map.entries()) {
      if (v.resetAt < now) map.delete(k);
    }
  }

  return {
    get(key: string) { return map.get(key); },
    set(key: string, entry: RateLimitEntry) {
      if (map.size > 0 && map.size % 500 === 0) cleanup();
      map.set(key, entry);
    },
    size() { return map.size; },
  };
}

const store = createStore();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(
  identifier: string,
  maxRequests: number = RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW
): RateLimitResult {
  const now = Date.now();
  const key = `rl:${identifier}`;
  const current = store.get(key);

  if (!current || current.resetAt < now) {
    const entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: entry.resetAt };
  }

  if (current.count >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0, reset: current.resetAt };
  }

  current.count++;
  store.set(key, current);
  return { success: true, limit: maxRequests, remaining: maxRequests - current.count, reset: current.resetAt };
}

export function getIpFromRequest(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp    = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp)    return realIp;
  return "127.0.0.1";
}

export function rateLimitAuth(id: string): RateLimitResult {
  return rateLimit(`auth:${id}`, AUTH_RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
}

export function rateLimitApi(id: string): RateLimitResult {
  return rateLimit(`api:${id}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW);
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}
