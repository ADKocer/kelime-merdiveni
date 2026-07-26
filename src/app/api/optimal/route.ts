import { NextResponse } from "next/server";
import {
  getDailyPuzzleForDateKey,
  isValidPuzzleDate,
} from "@/lib/puzzle";
import { getIstanbulDateKey } from "@/lib/daily-clock";
import { getShortestPath } from "@/lib/pathfinding";
import { validateSolution } from "@/lib/game";
import { readSessionFromRequest } from "@/lib/game-session";
import {
  enforceRateLimit,
  enforceSameOrigin,
  jsonError,
  safeServerError,
} from "@/lib/api-guard";

export const dynamic = "force-dynamic";

function buildOptimalResponse(startWord: string, endWord: string) {
  const optimalPath =
    getShortestPath(startWord, endWord) ?? [startWord, endWord];
  const optimalSteps = Math.max(optimalPath.length - 1, 0);
  return { optimalSteps, optimalPath };
}

/**
 * En kısa yol: oturumda tamamlanmışsa veya geçerli tamamlanmış yol kanıtı varsa.
 * Geçmiş günlerde session bugününün üzerine yazıldığı için path kanıtı gerekir.
 */
export async function POST(request: Request) {
  const originBlock = enforceSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = enforceRateLimit(request, "optimal", 30, 60_000);
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      date?: string;
      path?: string[];
    };

    const todayKey = getIstanbulDateKey();
    const dateKey = body.date?.trim() || todayKey;

    if (!isValidPuzzleDate(dateKey, todayKey)) {
      return jsonError("Bu tarih için bilgi yok.", 400);
    }

    const puzzle = getDailyPuzzleForDateKey(dateKey);
    const session = readSessionFromRequest(request);

    const completedInSession =
      Boolean(session) &&
      session!.puzzleDate === dateKey &&
      session!.path[session!.path.length - 1] === puzzle.endWord;

    const proofPath = Array.isArray(body.path) ? body.path : null;
    const completedByProof =
      Boolean(proofPath) &&
      proofPath!.length >= 2 &&
      validateSolution(puzzle.startWord, puzzle.endWord, proofPath!).valid;

    if (!completedInSession && !completedByProof) {
      return jsonError(
        "En kısa yol bilgisi yalnızca tamamladıktan sonra.",
        403,
      );
    }

    return NextResponse.json(
      buildOptimalResponse(puzzle.startWord, puzzle.endWord),
    );
  } catch (error) {
    return safeServerError("Bilgi alınamadı.", error);
  }
}

/** Eski istemciler için: yalnızca oturum tamamlanmışsa. */
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

    return NextResponse.json(
      buildOptimalResponse(puzzle.startWord, puzzle.endWord),
    );
  } catch (error) {
    return safeServerError("Bilgi alınamadı.", error);
  }
}
