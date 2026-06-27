/**
 * Simple in-process rate limiter for Next.js API routes (no external dependencies).
 * Uses a sliding window counter stored in a Map. Sufficient to mitigate
 * unsophisticated spam on serverless functions where Redis is not available.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Evict stale entries every 5 minutes to prevent unbounded memory growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export function rateLimit(
  identifier: string,
  action: string,
  options: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, retryAfterMs: 0 };
  }

  if (entry.count >= options.limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, remaining: options.limit - entry.count, retryAfterMs: 0 };
}

/** Extract the real client IP from Next.js request headers (Vercel-aware). */
export function getClientIp(req: import("next/server").NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
