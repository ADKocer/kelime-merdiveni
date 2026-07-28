import { NextResponse } from "next/server";
import {
  createSessionToken,
  newSession,
  readSessionFromRequest,
  sessionCookieHeader,
} from "@/lib/game-session";
import {
  createPlayerToken,
  playerCookieHeader,
  resolvePlayerIdentity,
} from "@/lib/player-identity";
import { getClaimedNameForPlayer } from "@/lib/db";
import {
  enforceRateLimit,
  safeServerError,
} from "@/lib/api-guard";
import {
  getDailyPuzzle,
  getDailyPuzzleForDateKey,
  isValidPuzzleDate,
} from "@/lib/puzzle";
import { getIstanbulDateKey } from "@/lib/daily-clock";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "puzzle", 60, 60_000);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const todayKey = getIstanbulDateKey();

    if (dateParam && !isValidPuzzleDate(dateParam, todayKey)) {
      return NextResponse.json(
        { error: "Bu tarih için merdiven oynanamaz." },
        { status: 400 },
      );
    }

    const puzzle = dateParam
      ? getDailyPuzzleForDateKey(dateParam)
      : getDailyPuzzle();

    const existing = readSessionFromRequest(request);
    const session =
      existing &&
      existing.puzzleDate === puzzle.date &&
      existing.path[0] === puzzle.startWord
        ? existing
        : newSession(puzzle.date, puzzle.startWord);

    const { identity } = resolvePlayerIdentity(request);
    const claimedName = await getClaimedNameForPlayer(identity.playerId);

    const token = createSessionToken(session);
    const response = NextResponse.json({
      date: puzzle.date,
      todayKey,
      startWord: puzzle.startWord,
      endWord: puzzle.endWord,
      wordLength: puzzle.wordLength,
      puzzleNumber: puzzle.puzzleNumber,
      isToday: puzzle.date === todayKey,
      sessionPath: session.path,
      hintCount: session.hintCount,
      claimedPlayerName: claimedName,
    });
    response.headers.append("Set-Cookie", sessionCookieHeader(token));
    response.headers.append(
      "Set-Cookie",
      playerCookieHeader(createPlayerToken(identity)),
    );
    return response;
  } catch (error) {
    return safeServerError("Günlük merdiven yüklenemedi.", error);
  }
}
