import fs from "fs";
import path from "path";

export interface DailyPuzzleRecord {
  start: string;
  end: string;
  steps: number;
}

interface WordDatabase {
  words: string[];
  neighbors: Record<string, string[]>;
  puzzles: DailyPuzzleRecord[];
}

let cached: WordDatabase | null = null;
let cachedWordSet: Set<string> | null = null;

export function getWordDatabase(): WordDatabase {
  if (cached) return cached;

  const filePath = path.join(process.cwd(), "data", "worddb.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(
      "Kelime veritabanı bulunamadı. Önce `npm run build:worddb` çalıştırın.",
    );
  }

  cached = JSON.parse(fs.readFileSync(filePath, "utf-8")) as WordDatabase;
  cachedWordSet = new Set(cached.words);
  return cached;
}

export function isKnownWord(word: string): boolean {
  if (!cachedWordSet) {
    cachedWordSet = new Set(getWordDatabase().words);
  }
  return cachedWordSet.has(word);
}

export function getDailyPuzzles(): DailyPuzzleRecord[] {
  return getWordDatabase().puzzles;
}

export function getNeighbors(word: string): string[] {
  return getWordDatabase().neighbors[word] ?? [];
}
