type Bucket = number[];

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Basit bellek içi rate limit (tek process / long-running Node için).
 * Serverless'ta instance başına çalışır; yine de abuse'ü yavaşlatır.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const existing = buckets.get(key) ?? [];
  const recent = existing.filter((ts) => ts > cutoff);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    const retryAfterSec = Math.max(
      1,
      Math.ceil((recent[0]! + windowMs - now) / 1000),
    );
    return { ok: false, remaining: 0, retryAfterSec };
  }

  recent.push(now);
  buckets.set(key, recent);

  if (buckets.size > 5000) {
    for (const [k, stamps] of buckets) {
      const kept = stamps.filter((ts) => ts > cutoff);
      if (kept.length === 0) buckets.delete(k);
      else buckets.set(k, kept);
    }
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - recent.length),
    retryAfterSec: 0,
  };
}

export function clientKey(request: Request, route: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${route}:${ip}`;
}
