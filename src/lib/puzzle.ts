import { getDailyPuzzles } from "./worddb";
import { getIstanbulDateKey, GAME_LAUNCH_DATE } from "./daily-clock";
import { getShortestPathLength, isReachable } from "./pathfinding";

export interface DailyPuzzle {
  date: string;
  startWord: string;
  endWord: string;
  wordLength: number;
  puzzleNumber: number;
  optimalSteps: number;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function daysSinceEpoch(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function getPuzzleNumber(dateKey: string): number {
  return Math.max(
    1,
    daysSinceEpoch(dateKey) - daysSinceEpoch(GAME_LAUNCH_DATE) + 1,
  );
}

export function getDailyPuzzle(date = new Date()): DailyPuzzle {
  return getDailyPuzzleForDateKey(getIstanbulDateKey(date));
}

export function getDailyPuzzleForDateKey(dateKey: string): DailyPuzzle {
  const puzzles = getDailyPuzzles();

  if (puzzles.length === 0) {
    throw new Error("Merdiven listesi boş. `npm run build:worddb` yeniden çalıştırın.");
  }

  const selected = puzzles[hashString(dateKey) % puzzles.length];

  if (!isReachable(selected.start, selected.end)) {
    throw new Error(
      `Merdiven çözülemez: ${selected.start} → ${selected.end}`,
    );
  }

  const optimalSteps =
    getShortestPathLength(selected.start, selected.end) ?? selected.steps;

  return {
    date: dateKey,
    startWord: selected.start,
    endWord: selected.end,
    wordLength: selected.start.length,
    puzzleNumber: getPuzzleNumber(dateKey),
    optimalSteps,
  };
}

export function isValidPuzzleDate(dateKey: string, todayKey = getIstanbulDateKey()): boolean {
  return dateKey >= GAME_LAUNCH_DATE && dateKey <= todayKey;
}
