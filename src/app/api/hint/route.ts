import { NextResponse } from "next/server";
import { getNextMoveHint } from "@/lib/pathfinding";
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
import { getDailyPuzzleForDateKey } from "@/lib/puzzle";

export async function POST(request: Request) {
  const originBlock = enforceSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = enforceRateLimit(request, "hint", 60, 60_000);
  if (limited) return limited;

  try {
    const session = readSessionFromRequest(request);
    if (!session) {
      return jsonError("Oyun oturumu bulunamadı. Sayfayı yenile.", 401);
    }

    const puzzle = getDailyPuzzleForDateKey(session.puzzleDate);
    const current = session.path[session.path.length - 1]!;

    if (current === puzzle.endWord) {
      return jsonError("Hedefe zaten ulaştınız.", 400);
    }

    const hint = getNextMoveHint(current, puzzle.endWord);
    if (!hint) {
      return jsonError("Bu konum için ipucu bulunamadı.", 400);
    }

    const hintCount = session.hintCount + 1;
    const token = createSessionToken({
      ...session,
      hintCount,
    });

    const response = NextResponse.json({ ...hint, hintCount });
    response.headers.set("Set-Cookie", sessionCookieHeader(token));
    return response;
  } catch (error) {
    return safeServerError("İpucu alınamadı.", error);
  }
}
