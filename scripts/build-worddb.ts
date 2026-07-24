import fs from "fs";
import path from "path";

const WORD_SOURCE_URL =
  "https://raw.githubusercontent.com/ahakanacar/turkish-dictionary-dataset-and-statistics/main/turkish_words_clean.csv";
const WORD_SOURCE_REPO =
  "https://github.com/ahakanacar/turkish-dictionary-dataset-and-statistics";
const WORD_SOURCE_LICENSE = "MIT";
const DATA_DIR = path.join(process.cwd(), "data");
const WORDDB_FILE = path.join(DATA_DIR, "worddb.json");
const WORD_LENGTH = 4;

const ALLOWED_WORD_TYPES = new Set([
  "Noun",
  "Adjective",
  "Verb",
  "Adverb",
]);

const TURKISH_LOWER_MAP: Record<string, string> = {
  I: "ı",
  İ: "i",
};

const COMMON_SUFFIXES = [
  "lar",
  "ler",
  "ları",
  "leri",
  "lık",
  "lik",
  "luk",
  "lük",
  "lı",
  "li",
  "lu",
  "lü",
  "sız",
  "siz",
  "suz",
  "süz",
  "cı",
  "ci",
  "cu",
  "cü",
  "da",
  "de",
  "ta",
  "te",
  "dan",
  "den",
  "tan",
  "ten",
  "ın",
  "in",
  "un",
  "ün",
  "im",
  "ım",
  "um",
  "üm",
  "sin",
  "sın",
  "sun",
  "sün",
  "miz",
  "mız",
  "muz",
  "müz",
  "niz",
  "nız",
  "nuz",
  "nüz",
  "si",
  "sı",
  "su",
  "sü",
  "ca",
  "ce",
  "mış",
  "miş",
  "muş",
  "müş",
];

function normalizeTurkish(word: string): string {
  return word
    .trim()
    .replace(/\s+/g, "")
    .split("")
    .map((char) => TURKISH_LOWER_MAP[char] ?? char.toLowerCase())
    .join("");
}

function isValidWord(word: string): boolean {
  if (word.length !== WORD_LENGTH) return false;
  if (!/^[a-zçğıöşü]+$/.test(word)) return false;
  return true;
}

function isInflectedForm(word: string, dictionary: Set<string>): boolean {
  for (const suffix of COMMON_SUFFIXES) {
    if (word.length <= suffix.length + 2) continue;
    if (!word.endsWith(suffix)) continue;

    const stem = word.slice(0, -suffix.length);
    if (stem.length >= 2 && dictionary.has(stem)) {
      return true;
    }
  }
  return false;
}

function oneLetterDiff(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diff++;
    if (diff > 1) return false;
  }
  return diff === 1;
}

function buildNeighbors(words: string[]): Record<string, string[]> {
  const neighbors: Record<string, string[]> = {};

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const list: string[] = [];
    for (let j = i + 1; j < words.length; j++) {
      const other = words[j];
      if (oneLetterDiff(word, other)) {
        list.push(other);
        neighbors[other] = neighbors[other] ?? [];
        neighbors[other].push(word);
      }
    }
    neighbors[word] = [...(neighbors[word] ?? []), ...list];
  }

  return neighbors;
}

function findShortestPath(
  start: string,
  end: string,
  neighbors: Record<string, string[]>,
): string[] | null {
  if (start === end) return [start];

  const queue: string[] = [start];
  const visited = new Set<string>([start]);
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === end) break;

    for (const neighbor of neighbors[current] ?? []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      parent.set(neighbor, current);
      queue.push(neighbor);
    }
  }

  if (!visited.has(end)) return null;

  const path: string[] = [];
  let cursor: string | undefined = end;
  while (cursor) {
    path.push(cursor);
    cursor = parent.get(cursor);
  }

  return path.reverse();
}

function buildDailyPuzzles(
  words: string[],
  neighbors: Record<string, string[]>,
  targetCount = 400,
): Array<{ start: string; end: string; steps: number }> {
  const puzzles: Array<{ start: string; end: string; steps: number }> = [];
  const seen = new Set<string>();
  let attempts = 0;

  while (puzzles.length < targetCount && attempts < 20_000) {
    attempts++;
    const start = words[Math.floor(Math.random() * words.length)];
    const end = words[Math.floor(Math.random() * words.length)];
    if (start === end) continue;

    const key = [start, end].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);

    const path = findShortestPath(start, end, neighbors);
    if (!path) continue;

    const steps = path.length - 1;
    if (steps < 4 || steps > 8) continue;

    puzzles.push({ start, end, steps });
  }

  if (!puzzles.some((puzzle) => puzzle.start === "koyu" && puzzle.end === "mavi")) {
    puzzles.unshift({ start: "koyu", end: "mavi", steps: 5 });
  }

  return puzzles;
}

function parseWordsFromCsv(csv: string): string[] {
  const unique = new Set<string>();

  for (const line of csv.trim().split("\n").slice(1)) {
    const match = line.match(/^"([^"]+)",(\d+),\d+,"([^"]+)"/);
    if (!match) continue;

    const [, rawWord, lengthText, wordType] = match;
    if (Number(lengthText) !== WORD_LENGTH) continue;
    if (!ALLOWED_WORD_TYPES.has(wordType)) continue;

    const word = normalizeTurkish(rawWord);
    if (!isValidWord(word)) continue;
    unique.add(word);
  }

  return [...unique];
}

async function main() {
  console.log("GitHub kelime veri seti indiriliyor...");
  console.log(`Kaynak: ${WORD_SOURCE_REPO} (${WORD_SOURCE_LICENSE})`);

  const response = await fetch(WORD_SOURCE_URL, {
    headers: {
      "User-Agent": "KelimeMerdiveni/1.0 (word database build script)",
    },
  });

  if (!response.ok) {
    throw new Error(`Kelime listesi indirilemedi: ${response.status}`);
  }

  const csv = await response.text();
  const parsed = parseWordsFromCsv(csv);
  const dictionarySet = new Set(parsed);
  const words = parsed
    .filter((word) => !isInflectedForm(word, dictionarySet))
    .sort((a, b) => a.localeCompare(b, "tr"));

  console.log(`${words.length} adet ${WORD_LENGTH} harfli kelime ayıklandı.`);

  const neighbors = buildNeighbors(words);
  console.log("Komşuluk haritası oluşturuluyor...");
  console.log("Günlük görev havuzu üretiliyor...");
  const puzzles = buildDailyPuzzles(words, neighbors);

  const worddb = {
    version: 1,
    createdAt: new Date().toISOString(),
    source: {
      name: "turkish-dictionary-dataset-and-statistics",
      repository: WORD_SOURCE_REPO,
      license: WORD_SOURCE_LICENSE,
      file: "turkish_words_clean.csv",
    },
    wordLength: WORD_LENGTH,
    wordCount: words.length,
    words,
    neighbors,
    puzzles,
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(WORDDB_FILE, JSON.stringify(worddb, null, 0));

  console.log(`Kelime Merdiveni kelime veritabanı hazır: ${WORDDB_FILE}`);
  console.log(`Kelime sayısı: ${words.length}`);
  console.log(`Günlük görev havuzu: ${puzzles.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
