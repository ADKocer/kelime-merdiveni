import { NextResponse } from "next/server";
import { validateMove } from "@/lib/game";
import { normalizeInput } from "@/lib/word-input";
import {
  createSessionToken,
  readSessionFromRequest,
  sessionCookieHeader,
} from "@/lib/game-session";
import {
  enforceRateLimit,
  enforceSameOrigin,
} from "@/lib/api-guard";
import { getDailyPuzzleForDateKey } from "@/lib/puzzle";

const MAX_PATH_STEPS = 40;

export async function POST(request: Request) {
  const originBlock = enforceSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = enforceRateLimit(request, "validate", 90, 60_000);
  if (limited) return limited;

  try {
    const session = readSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { valid: false, reason: "Oyun oturumu bulunamadı. Sayfayı yenile." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { nextWord?: string };
    if (!body.nextWord) {
      return NextResponse.json(
        { valid: false, reason: "nextWord gerekli." },
        { status: 400 },
      );
    }

    if (session.path.length - 1 >= MAX_PATH_STEPS) {
      return NextResponse.json(
        { valid: false, reason: "Çok fazla adım. Geri almayı dene." },
        { status: 400 },
      );
    }

    const puzzle = getDailyPuzzleForDateKey(session.puzzleDate);
    const previousWord = session.path[session.path.length - 1]!;
    const next = normalizeInput(body.nextWord);

    if (session.path.includes(next)) {
      return NextResponse.json(
        { valid: false, reason: "Aynı kelime tekrar kullanılamaz." },
        { status: 400 },
      );
    }

    const result = validateMove(previousWord, next);
    if (!result.valid) {
      return NextResponse.json(result);
    }

    const nextPath = [...session.path, next];
    const completed = next === puzzle.endWord;
    const token = createSessionToken({
      ...session,
      path: nextPath,
    });

    const response = NextResponse.json({
      valid: true,
      path: nextPath,
      completed,
      steps: nextPath.length - 1,
    });
    response.headers.set("Set-Cookie", sessionCookieHeader(token));
    return response;
  } catch (error) {
    console.error("validate failed", error);
    return NextResponse.json(
      { valid: false, reason: "Doğrulama başarısız." },
      { status: 500 },
    );
  }
}
