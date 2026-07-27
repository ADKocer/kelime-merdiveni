import fs from "fs";
import path from "path";
import readline from "readline";
import zlib from "zlib";

const WORDDB_FILE = path.join(process.cwd(), "data", "worddb.json");
const KAIKKI_GZ = path.join(process.cwd(), "data", ".trwiktionary-raw.jsonl.gz");

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

  const allSet = new Set(db.words.map(turkishLower));
  const puzzleWords = new Set<string>();
  for (const puzzle of db.puzzles) {
    puzzleWords.add(turkishLower(puzzle.start));
    puzzleWords.add(turkishLower(puzzle.end));
  }

  const foundAll = new Set<string>();
  const foundPuzzle = new Set<string>();

  const input = fs.createReadStream(KAIKKI_GZ).pipe(zlib.createGunzip());
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  let lines = 0;
  let turkishEntries = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    lines += 1;
    let entry: {
      lang_code?: string;
      word?: string;
      forms?: Array<{ form?: string }>;
      senses?: Array<{ glosses?: string[]; raw_glosses?: string[] }>;
    };
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    if (entry.lang_code !== "tr") continue;
    turkishEntries += 1;
    if (!hasGloss(entry)) continue;

    const candidates = new Set<string>();
    if (entry.word) candidates.add(turkishLower(entry.word));
    for (const form of entry.forms ?? []) {
      if (form.form) candidates.add(turkishLower(form.form));
    }

    for (const candidate of candidates) {
      if (allSet.has(candidate)) foundAll.add(candidate);
      if (puzzleWords.has(candidate)) foundPuzzle.add(candidate);
    }
  }

  console.log(
    JSON.stringify(
      {
        source: "trwiktionary raw extract",
        totalLines: lines,
        turkishEntries,
        worddb: {
          totalWords: allSet.size,
          withMeaning: foundAll.size,
          overlapPercent: Number(
            ((foundAll.size / allSet.size) * 100).toFixed(1),
          ),
        },
        puzzleStartEnd: {
          totalUnique: puzzleWords.size,
          withMeaning: foundPuzzle.size,
          overlapPercent: Number(
            ((foundPuzzle.size / puzzleWords.size) * 100).toFixed(1),
          ),
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
