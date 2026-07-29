import fs from "fs";
import path from "path";

function turkishLower(word: string): string {
  return word
    .replace(/I/g, "ı")
    .replace(/İ/g, "i")
    .toLocaleLowerCase("tr-TR");
}

let cachedEntries: Record<string, string> | null = null;

function loadEntries(): Record<string, string> {
  if (cachedEntries) return cachedEntries;

  const filePath = path.join(process.cwd(), "public", "meanings.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(
      "Anlam sözlüğü bulunamadı. Önce `npm run build:meanings` çalıştırın.",
    );
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
    entries: Record<string, string>;
  };
  cachedEntries = data.entries;
  return cachedEntries;
}

export function getWordMeaningFromDb(word: string): string | null {
  const entries = loadEntries();
  return entries[turkishLower(word)] ?? null;
}
