import { NextResponse } from "next/server";
import { validateSolution } from "@/lib/game";
import {
  assertCanUseName,
  getBestScoreForPlayer,
  getClaimedNameForPlayer,
  saveScore,
} from "@/lib/db";
import { getDailyPuzzleForDateKey } from "@/lib/puzzle";
import { getIstanbulDateKey } from "@/lib/daily-clock";
import { getShortestPathLength } from "@/lib/pathfinding";
import { readSessionFromRequest } from "@/lib/game-session";
import { sanitizePlayerName } from "@/lib/player-name";
import {
  createPlayerToken,
  playerCookieHeader,
  resolvePlayerIdentity,
} from "@/lib/player-identity";
import {
  enforceRateLimit,
  enforceSameOrigin,
  jsonError,
  safeServerError,
} from "@/lib/api-guard";

const MAX_PATH_STEPS = 40;

export async function POST(request: Request) {
  const originBlock = enforceSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = enforceRateLimit(request, "submit", 20, 60_000);
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      playerName?: string;
      puzzleDate?: string;
    };

    const todayKey = getIstanbulDateKey();
    const puzzleDate = body.puzzleDate?.trim() ?? todayKey;

    if (puzzleDate !== todayKey) {
      return jsonError(
        "Yalnızca bugünün merdiveni onur tablosuna yazılabilir.",
        400,
      );
    }

    const nameResult = sanitizePlayerName(body.playerName);
    if (!nameResult.ok) {
      return jsonError(nameResult.error, 400);
    }

    const { identity, isNew } = resolvePlayerIdentity(request);
    const nameCheck = await assertCanUseName(identity.playerId, nameResult.name);
    if (!nameCheck.ok) {
      return jsonError(nameCheck.error, 409);
    }

    const session = readSessionFromRequest(request);
    if (!session || session.puzzleDate !== puzzleDate) {
      return jsonError(
        "Oyun oturumu geçersiz. Merdiveni yeniden tamamla.",
        401,
      );
    }

    const path = session.path;
    const steps = path.length - 1;

    if (steps < 1 || steps > MAX_PATH_STEPS) {
      return jsonError("Geçersiz çözüm uzunluğu.", 400);
    }

    const puzzle = getDailyPuzzleForDateKey(puzzleDate);
    const validation = validateSolution(puzzle.startWord, puzzle.endWord, path);

    if (!validation.valid) {
      return jsonError(validation.reason, 400);
    }

    const optimalSteps =
      getShortestPathLength(puzzle.startWord, puzzle.endWord) ??
      puzzle.optimalSteps;

    if (steps > Math.max(optimalSteps * 3, optimalSteps + 15)) {
      return jsonError("Çözüm beklenenden çok uzun.", 400);
    }

    const existing = await getBestScoreForPlayer(identity.playerId, puzzle.date);

    if (existing && existing.steps <= steps) {
      const response = NextResponse.json({
        saved: false,
        message: "Daha iyi bir skorunuz zaten kayıtlı.",
        steps: existing.steps,
        optimalSteps,
        playerName:
          (await getClaimedNameForPlayer(identity.playerId)) ?? nameResult.name,
      });
      if (isNew) {
        response.headers.append(
          "Set-Cookie",
          playerCookieHeader(createPlayerToken(identity)),
        );
      }
      return response;
    }

    let entry;
    try {
      entry = await saveScore({
        playerId: identity.playerId,
        playerName: nameResult.name,
        puzzleDate: puzzle.date,
        steps,
        path,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Skor kaydedilemedi.";
      if (
        message.includes("alınmış") ||
        message.includes("kayıtlısın")
      ) {
        return jsonError(message, 409);
      }
      throw error;
    }

    const response = NextResponse.json({
      saved: true,
      updated: Boolean(existing),
      steps: entry.steps,
      completedAt: entry.completedAt,
      optimalSteps,
      playerName: entry.playerName,
    });

    response.headers.append(
      "Set-Cookie",
      playerCookieHeader(createPlayerToken(identity)),
    );

    return response;
  } catch (error) {
    return safeServerError("Skor kaydedilemedi.", error);
  }
}
