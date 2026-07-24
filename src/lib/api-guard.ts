import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export function jsonError(
  message: string,
  status: number,
  extraHeaders?: HeadersInit,
) {
  return NextResponse.json({ error: message }, { status, headers: extraHeaders });
}

export function enforceRateLimit(
  request: Request,
  route: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const result = rateLimit(clientKey(request, route), limit, windowMs);
  if (result.ok) return null;

  return jsonError("Çok fazla istek. Biraz sonra tekrar dene.", 429, {
    "Retry-After": String(result.retryAfterSec),
  });
}

export function safeServerError(fallback: string, error: unknown): NextResponse {
  console.error(fallback, error);
  return jsonError(fallback, 500);
}

/** Origin kontrolü — tarayıcıdan gelen state-changing istekler için. */
export function enforceSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null; // curl / non-browser; rate limit yeterli

  let expected: string;
  try {
    expected = new URL(request.url).origin;
  } catch {
    return jsonError("Geçersiz istek.", 400);
  }

  if (origin !== expected) {
    return jsonError("İstek reddedildi.", 403);
  }

  return null;
}
