import fs from "fs";
import path from "path";
import readline from "readline";
import { createGunzip } from "zlib";

const WORDDB_FILE = path.join(process.cwd(), "data", "worddb.json");
const MANUAL_FILE = path.join(process.cwd(), "data", "manual-meanings.json");
const TRWIKTIONARY_GZ = path.join(
  process.cwd(),
  "data",
  ".trwiktionary-raw.jsonl.gz",
);
const TRWIKTIONARY_URL =
  "https://kaikki.org/trwiktionary/raw-wiktextract-data.jsonl.gz";
const OUTPUT_FILE = path.join(process.cwd(), "public", "meanings.json");

const POS_PRIORITY: Record<string, number> = {
  noun: 100,
  adj: 90,
  verb: 85,
  adv: 80,
  intj: 75,
  interjection: 75,
  phrase: 70,
  character: 25,
  name: 10,
  proper_noun: 10,
};

function turkishLower(word: string): string {
  return word
    .replace(/I/g, "ı")
    .replace(/İ/g, "i")
    .toLocaleLowerCase("tr-TR");
}

/** Oyun sözlüğü ile Vikisözlük maddelerini eşleştirmek için (âlim → alim). */
function normalizeLemma(word: string): string {
  return turkishLower(word)
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u")
    .replace(/ô/g, "o");
}

function isCapitalizedNameLemma(word: string): boolean {
  if (!word) return false;
  const first = word[0];
  const rest = word.slice(1);
  return (
    first === first.toLocaleUpperCase("tr-TR") &&
    rest === rest.toLocaleLowerCase("tr-TR")
  );
}

function cleanGloss(text: string): string {
  return text
    .replace(/\[\[(?:[^\]|]+\|)?([^\]|]+)\]\]/g, "$1")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shortenMeaning(text: string, maxLength = 140): string {
  const firstClause = text.split(/[.;]/)[0]?.trim() ?? text;
  if (firstClause.length <= maxLength) return firstClause;
  return `${firstClause.slice(0, maxLength - 1).trim()}…`;
}

function pickMeaning(entry: {
  senses?: Array<{ glosses?: string[]; raw_glosses?: string[] }>;
}): string {
  for (const sense of entry.senses ?? []) {
    for (const gloss of sense.glosses ?? sense.raw_glosses ?? []) {
      const cleaned = cleanGloss(String(gloss));
      if (cleaned.length > 0) {
        return shortenMeaning(cleaned);
      }
    }
  }
  return "";
}

function hasGloss(entry: {
  senses?: Array<{ glosses?: string[]; raw_glosses?: string[] }>;
}): boolean {
  return pickMeaning(entry).length > 0;
}

function scoreMeaningCandidate(
  pos: string | undefined,
  meaning: string,
  lemma: string,
): number {
  let score = POS_PRIORITY[pos ?? ""] ?? 50;
  const lower = meaning.toLocaleLowerCase("tr-TR");

  if (pos === "name" || pos === "proper_noun") {
    if (isCapitalizedNameLemma(lemma)) {
      score -= 60;
    } else {
      score -= 25;
    }
  }

  if (
    /ilçe|köy|mahalle|belediy|bağlı bir|ili .* ilçe/.test(lower)
  ) {
    score -= 45;
  }
  if (/burç|gökyüzünde|güneşin .* tarih|doğanların ait olduğu/.test(lower)) {
    score -= 45;
  }
  if (/erkek adı|kız adı|bir .* adı|unisex adı|soyadı/.test(lower)) {
    score -= 50;
  }

  return score;
}

function shouldSkipEntry(
  pos: string | undefined,
  meaning: string,
  lemma: string,
): boolean {
  const score = scoreMeaningCandidate(pos, meaning, lemma);
  return score < 20;
}

async function ensureTrWiktionaryDump(): Promise<void> {
  if (fs.existsSync(TRWIKTIONARY_GZ)) return;

  console.log("trwiktionary dump indiriliyor…");
  const response = await fetch(TRWIKTIONARY_URL);
  if (!response.ok) {
    throw new Error(`trwiktionary indirilemedi: ${response.status}`);
  }

  fs.mkdirSync(path.dirname(TRWIKTIONARY_GZ), { recursive: true });
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(TRWIKTIONARY_GZ, buffer);
  console.log("trwiktionary dump kaydedildi.");
}

async function buildMeanings(): Promise<void> {
  await ensureTrWiktionaryDump();

  const db = JSON.parse(fs.readFileSync(WORDDB_FILE, "utf-8")) as {
    words: string[];
  };
  const manual = JSON.parse(fs.readFileSync(MANUAL_FILE, "utf-8")) as Record<
    string,
    string
  >;

  const targetWords = new Set(db.words.map(turkishLower));
  const lemmaToTargets = new Map<string, string[]>();
  for (const word of targetWords) {
    const key = normalizeLemma(word);
    const list = lemmaToTargets.get(key) ?? [];
    list.push(word);
    lemmaToTargets.set(key, list);
  }

  const bestMatches: Record<string, { score: number; meaning: string }> = {};

  const input = fs.createReadStream(TRWIKTIONARY_GZ).pipe(createGunzip());
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  let wiktionaryMatches = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    let entry: {
      lang_code?: string;
      word?: string;
      pos?: string;
      forms?: Array<{ form?: string }>;
      senses?: Array<{ glosses?: string[]; raw_glosses?: string[] }>;
    };

    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    if (entry.lang_code !== "tr" || !hasGloss(entry)) continue;

    const meaning = pickMeaning(entry);
    const lemma = entry.word ?? "";
    if (shouldSkipEntry(entry.pos, meaning, lemma)) continue;

    const score = scoreMeaningCandidate(entry.pos, meaning, lemma);
    const candidates = new Set<string>();
    if (entry.word) candidates.add(normalizeLemma(entry.word));
    for (const form of entry.forms ?? []) {
      if (form.form) candidates.add(normalizeLemma(form.form));
    }

    for (const candidate of candidates) {
      const gameWords = lemmaToTargets.get(candidate);
      if (!gameWords) continue;

      for (const gameWord of gameWords) {
        const existing = bestMatches[gameWord];
        if (!existing || score > existing.score) {
          bestMatches[gameWord] = { score, meaning };
          if (!existing) wiktionaryMatches += 1;
        }
      }
    }
  }

  const entries: Record<string, string> = { ...manual };
  for (const [word, match] of Object.entries(bestMatches)) {
    if (!entries[word]) {
      entries[word] = match.meaning;
    }
  }

  const missing = [...targetWords].filter((word) => !entries[word]);
  if (missing.length > 0) {
    console.warn(
      `Uyarı: ${missing.length} kelime için anlam bulunamadı:`,
      missing.slice(0, 10).join(", "),
      missing.length > 10 ? "…" : "",
    );
  }

  const payload = {
    version: 1,
    attribution:
      "Türkçe Vikisözlük (CC BY-SA 4.0) ve manuel tanımlar",
    wiktionaryUrl: "https://tr.wiktionary.org",
    entries,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload));

  console.log(
    `meanings.json yazıldı: ${Object.keys(entries).length}/${targetWords.size} kelime (${wiktionaryMatches} Vikisözlük, ${Object.keys(manual).length} manuel)`,
  );
}

buildMeanings().catch((error) => {
  console.error(error);
  process.exit(1);
});
