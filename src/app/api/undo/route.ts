import { NextResponse } from "next/server";
import {
  createSessionToken,
  readSessionFromRequest,
  sessionCookieHeader,
} from "@/lib/game-session";
import {
  enforceRateLimit,
  enforceSameOrigin,
  jsonError,
  safeServerError,
} from "@/lib/api-guard";

export async function POST(request: Request) {
  const originBlock = enforceSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = enforceRateLimit(request, "undo", 90, 60_000);
  if (limited) return limited;

  try {
    const session = readSessionFromRequest(request);
    if (!session) {
      return jsonError("Oyun oturumu bulunamadı. Sayfayı yenile.", 401);
    }

    if (session.path.length <= 1) {
      return jsonError("Geri alınacak adım yok.", 400);
    }

    const nextPath = session.path.slice(0, -1);
    const token = createSessionToken({
      ...session,
      path: nextPath,
    });

    const response = NextResponse.json({
      path: nextPath,
      steps: nextPath.length - 1,
    });
    response.headers.set("Set-Cookie", sessionCookieHeader(token));
    return response;
  } catch (error) {
    return safeServerError("Geri alma başarısız.", error);
  }
}
