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

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function parseOriginParts(value: string): { protocol: string; host: string } | null {
  try {
    const url = new URL(value);
    return { protocol: url.protocol, host: url.hostname };
  } catch {
    return null;
  }
}

/** Vercel/özel domain: request.url vercel.app olabilir; gerçek host header'da. */
export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");
  const host = (forwardedHost ?? hostHeader)?.split(",")[0]?.trim();
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

function originsMatch(requestOrigin: string, browserOrigin: string): boolean {
  if (requestOrigin === browserOrigin) return true;

  const requestParts = parseOriginParts(requestOrigin);
  const browserParts = parseOriginParts(browserOrigin);
  if (!requestParts || !browserParts) return false;

  return (
    requestParts.protocol === browserParts.protocol &&
    normalizeHostname(requestParts.host) === normalizeHostname(browserParts.host)
  );
}

/** Origin kontrolü — tarayıcıdan gelen state-changing istekler için. */
export function enforceSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null; // curl / non-browser; rate limit yeterli

  const expected = getRequestOrigin(request);
  if (!originsMatch(expected, origin)) {
    return jsonError("İstek reddedildi.", 403);
  }

  return null;
}
