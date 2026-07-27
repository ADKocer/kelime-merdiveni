export function turkishLower(word: string): string {
  return word
    .replace(/I/g, "ı")
    .replace(/İ/g, "i")
    .toLocaleLowerCase("tr-TR");
}

interface MeaningsFile {
  version: number;
  attribution: string;
  wiktionaryUrl: string;
  entries: Record<string, string>;
}

let cachedEntries: Record<string, string> | null = null;
let cachedMeta: Pick<MeaningsFile, "attribution" | "wiktionaryUrl"> | null =
  null;
let loadPromise: Promise<void> | null = null;

export async function loadWordMeanings(): Promise<Record<string, string>> {
  if (cachedEntries) return cachedEntries;

  if (!loadPromise) {
    loadPromise = (async () => {
      const response = await fetch("/meanings.json");
      if (!response.ok) {
        throw new Error("Anlam sözlüğü yüklenemedi.");
      }

      const data = (await response.json()) as MeaningsFile;
      cachedEntries = data.entries;
      cachedMeta = {
        attribution: data.attribution,
        wiktionaryUrl: data.wiktionaryUrl,
      };
    })();
  }

  await loadPromise;
  return cachedEntries ?? {};
}

export function getMeaningAttribution():
  | Pick<MeaningsFile, "attribution" | "wiktionaryUrl">
  | null {
  return cachedMeta;
}

export function getWordMeaning(
  word: string,
  meanings: Record<string, string>,
): string | null {
  return meanings[turkishLower(word)] ?? null;
}
