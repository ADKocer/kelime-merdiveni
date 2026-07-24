import { createHmac, randomUUID, timingSafeEqual } from "crypto";

const COOKIE_NAME = "km_player";
const MAX_AGE_SEC = 60 * 60 * 24 * 400; // ~13 ay

export interface PlayerIdentity {
  playerId: string;
  issuedAt: number;
}

function getSecret(): string {
  return (
    process.env.GAME_SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "kelime-merdiveni-dev-secret-change-me"
  );
}

function encodePayload(identity: PlayerIdentity): string {
  return Buffer.from(JSON.stringify(identity), "utf8").toString("base64url");
}

function decodePayload(raw: string): PlayerIdentity | null {
  try {
    const data = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as PlayerIdentity;
    if (typeof data.playerId !== "string" || typeof data.issuedAt !== "number") {
      return null;
    }
    if (!data.playerId || data.playerId.length > 80) return null;
    return data;
  } catch {
    return null;
  }
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createPlayerToken(identity: PlayerIdentity): string {
  const payload = encodePayload(identity);
  return `${payload}.${sign(payload)}`;
}

export function verifyPlayerToken(
  token: string | undefined,
): PlayerIdentity | null {
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

  return decodePayload(payload);
}

export function newPlayerIdentity(): PlayerIdentity {
  return {
    playerId: randomUUID(),
    issuedAt: Date.now(),
  };
}

export function playerCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${secure}`;
}

export function readPlayerFromRequest(request: Request): PlayerIdentity | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`),
  );
  if (!match) return null;
  return verifyPlayerToken(decodeURIComponent(match[1]));
}

/** İstekteki jetonu kullanır; yoksa yeni üretir. */
export function resolvePlayerIdentity(request: Request): {
  identity: PlayerIdentity;
  isNew: boolean;
} {
  const existing = readPlayerFromRequest(request);
  if (existing) return { identity: existing, isNew: false };
  return { identity: newPlayerIdentity(), isNew: true };
}

export function nameKey(playerName: string): string {
  return playerName.trim().toLocaleLowerCase("tr");
}

export { COOKIE_NAME as PLAYER_COOKIE_NAME };
