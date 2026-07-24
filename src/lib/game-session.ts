import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "km_session";
const MAX_AGE_SEC = 60 * 60 * 24; // 24 saat

export interface GameSession {
  puzzleDate: string;
  path: string[];
  hintUsed: boolean;
  issuedAt: number;
}

function getSecret(): string {
  return (
    process.env.GAME_SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "kelime-merdiveni-dev-secret-change-me"
  );
}

function encodePayload(session: GameSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodePayload(raw: string): GameSession | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const data = JSON.parse(json) as GameSession;
    if (
      typeof data.puzzleDate !== "string" ||
      !Array.isArray(data.path) ||
      typeof data.hintUsed !== "boolean" ||
      typeof data.issuedAt !== "number"
    ) {
      return null;
    }
    if (!data.path.every((word) => typeof word === "string")) return null;
    return data;
  } catch {
    return null;
  }
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(session: GameSession): string {
  const payload = encodePayload(session);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): GameSession | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload);

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const session = decodePayload(payload);
  if (!session) return null;

  const ageMs = Date.now() - session.issuedAt;
  if (ageMs < 0 || ageMs > MAX_AGE_SEC * 1000) return null;

  return session;
}

export function sessionCookieHeader(token: string): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${secure}`;
}

export function clearSessionCookieHeader(): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readSessionFromRequest(request: Request): GameSession | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifySessionToken(decodeURIComponent(match[1]));
}

export function newSession(puzzleDate: string, startWord: string): GameSession {
  return {
    puzzleDate,
    path: [startWord],
    hintUsed: false,
    issuedAt: Date.now(),
  };
}

export { COOKIE_NAME, MAX_AGE_SEC };
