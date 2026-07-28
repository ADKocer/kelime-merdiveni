import { NextResponse } from "next/server";
import { validateSolution } from "@/lib/game";
import {
  assertCanUseName,
  getBestScoreForPlayer,
  getClaimedNameForPlayer,
  saveScore,
  scoreIsImprovement,
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

export async function POST(request: Request) {
  const originBlock = enforceSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = enforceRateLimit(request, "submit", 20, 60_000);
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      playerName?: string;
      puzzleDate?: string;
      path?: string[];
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
    const puzzle = getDailyPuzzleForDateKey(puzzleDate);

    const sessionPath =
      session &&
      session.puzzleDate === puzzleDate &&
      session.path.length >= 2
        ? session.path
        : null;

    const sessionComplete = Boolean(
      sessionPath &&
        validateSolution(puzzle.startWord, puzzle.endWord, sessionPath).valid,
    );

    const proofPath = Array.isArray(body.path) ? body.path : null;
    const proofComplete = Boolean(
      proofPath &&
        proofPath.length >= 2 &&
        validateSolution(puzzle.startWord, puzzle.endWord, proofPath).valid,
    );

    if (!sessionComplete && !proofComplete) {
      return jsonError(
        "Geçerli bir tamamlanmış çözüm gerekli. Merdiveni yeniden tamamlayın.",
        400,
      );
    }

    const path = sessionComplete ? sessionPath! : proofPath!;
    const steps = path.length - 1;
    const hints =
      sessionComplete && session && session.puzzleDate === puzzleDate
        ? session.hintCount
        : 0;

    if (steps < 1) {
      return jsonError("Geçersiz çözüm uzunluğu.", 400);
    }

    const optimalSteps =
      getShortestPathLength(puzzle.startWord, puzzle.endWord) ??
      puzzle.optimalSteps;

    const existing = await getBestScoreForPlayer(identity.playerId, puzzle.date);

    if (existing && !scoreIsImprovement(existing, steps, hints)) {
      const response = NextResponse.json({
        saved: false,
        message: "Daha iyi bir skorunuz zaten kayıtlı.",
        steps: existing.steps,
        hints: existing.hints,
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
        hints,
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
      hints: entry.hints,
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
