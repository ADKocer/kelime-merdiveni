import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db";
import { getDailyPuzzle } from "@/lib/puzzle";
import { enforceRateLimit, safeServerError } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "leaderboard", 60, 60_000);
  if (limited) return limited;

  try {
    const puzzle = getDailyPuzzle();
    const entries = (await getLeaderboard(puzzle.date, 10)).map((entry) => ({
      id: entry.id,
      playerName: entry.playerName,
      steps: entry.steps,
      hints: entry.hints,
      completedAt: entry.completedAt,
    }));

    return NextResponse.json({
      date: puzzle.date,
      entries,
    });
  } catch (error) {
    return safeServerError("Onur tablosu yüklenemedi.", error);
  }
}
