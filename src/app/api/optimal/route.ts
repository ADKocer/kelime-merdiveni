import { NextResponse } from "next/server";
import {
  getDailyPuzzleForDateKey,
  isValidPuzzleDate,
} from "@/lib/puzzle";
import { getIstanbulDateKey } from "@/lib/daily-clock";
import { getShortestPath } from "@/lib/pathfinding";
import { readSessionFromRequest } from "@/lib/game-session";
import { enforceRateLimit, jsonError, safeServerError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

/**
 * En kısa yol yalnızca oturumda merdiven tamamlandıysa döner.
 */
export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "optimal", 30, 60_000);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const todayKey = getIstanbulDateKey();
    const dateKey = dateParam ?? todayKey;

    if (!isValidPuzzleDate(dateKey, todayKey)) {
      return jsonError("Bu tarih için bilgi yok.", 400);
    }

    const session = readSessionFromRequest(request);
    const puzzle = getDailyPuzzleForDateKey(dateKey);

    const completedInSession =
      session &&
      session.puzzleDate === dateKey &&
      session.path[session.path.length - 1] === puzzle.endWord;

    if (!completedInSession) {
      return jsonError("En kısa yol bilgisi yalnızca tamamladıktan sonra.", 403);
    }

    const optimalPath =
      getShortestPath(puzzle.startWord, puzzle.endWord) ?? [
        puzzle.startWord,
        puzzle.endWord,
      ];
    const optimalSteps = Math.max(optimalPath.length - 1, 0);

    return NextResponse.json({ optimalSteps, optimalPath });
  } catch (error) {
    return safeServerError("Bilgi alınamadı.", error);
  }
}
