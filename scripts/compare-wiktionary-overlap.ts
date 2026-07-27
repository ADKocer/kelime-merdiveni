import fs from "fs";
import path from "path";
import readline from "readline";
import zlib from "zlib";

const WORDDB_FILE = path.join(process.cwd(), "data", "worddb.json");
const KAIKKI_GZ = path.join(process.cwd(), "data", ".kaikki-turkish.jsonl.gz");

function turkishLower(word: string): string {
  return word
    .replace(/I/g, "ı")
    .replace(/İ/g, "i")
    .toLocaleLowerCase("tr-TR");
}

function hasGloss(entry: {
  senses?: Array<{ glosses?: string[]; raw_glosses?: string[] }>;
}): boolean {
  for (const sense of entry.senses ?? []) {
    const glosses = sense.glosses ?? sense.raw_glosses ?? [];
    if (glosses.some((g) => typeof g === "string" && g.trim().length > 0)) {
      return true;
    }
  }
  return false;
}

async function main() {
  const db = JSON.parse(fs.readFileSync(WORDDB_FILE, "utf-8")) as {
    words: string[];
    puzzles: Array<{ start: string; end: string }>;
  };

  const allWords = db.words.map(turkishLower);
  const allSet = new Set(allWords);

  const puzzleWords = new Set<string>();
  for (const puzzle of db.puzzles) {
    puzzleWords.add(turkishLower(puzzle.start));
    puzzleWords.add(turkishLower(puzzle.end));
  }

  const foundAll = new Set<string>();
  const foundPuzzle = new Set<string>();
  const foundForms = new Set<string>();

  const input = fs.createReadStream(KAIKKI_GZ).pipe(zlib.createGunzip());
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  let lines = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    lines += 1;
    let entry: {
      word?: string;
      forms?: Array<{ form?: string; tags?: string[] }>;
      senses?: Array<{ glosses?: string[]; raw_glosses?: string[] }>;
    };
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    if (!hasGloss(entry)) continue;

    const candidates = new Set<string>();
    if (entry.word) candidates.add(turkishLower(entry.word));
    for (const form of entry.forms ?? []) {
      if (form.form) candidates.add(turkishLower(form.form));
    }

    for (const candidate of candidates) {
      if (allSet.has(candidate)) {
        foundAll.add(candidate);
        foundForms.add(candidate);
      }
      if (puzzleWords.has(candidate)) {
        foundPuzzle.add(candidate);
      }
    }
  }

  const missingAll = allWords.filter((w) => !foundAll.has(w));
  const missingPuzzle = [...puzzleWords].filter((w) => !foundPuzzle.has(w));

  console.log(
    JSON.stringify(
      {
        kaikkiLines: lines,
        worddb: {
          totalWords: allWords.length,
          withMeaning: foundAll.size,
          overlapPercent: Number(
            ((foundAll.size / allWords.length) * 100).toFixed(1),
          ),
          missingCount: missingAll.length,
          missingSample: missingAll.slice(0, 30),
        },
        puzzleStartEnd: {
          totalUnique: puzzleWords.size,
          withMeaning: foundPuzzle.size,
          overlapPercent: Number(
            ((foundPuzzle.size / puzzleWords.size) * 100).toFixed(1),
          ),
          missingCount: missingPuzzle.length,
          missingSample: missingPuzzle.slice(0, 30),
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
