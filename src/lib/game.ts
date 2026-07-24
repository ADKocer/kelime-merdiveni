import { isKnownWord } from "./worddb";
import { normalizeInput } from "./word-input";

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

type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

function countLetterDiff(a: string, b: string): number {
  if (a.length !== b.length) return Infinity;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diff++;
  }
  return diff;
}

function looksLikeInflectedForm(word: string): boolean {
  for (const suffix of COMMON_SUFFIXES) {
    if (word.length <= suffix.length + 2) continue;
    if (!word.endsWith(suffix)) continue;

    const stem = word.slice(0, -suffix.length);
    if (isKnownWord(stem)) return true;
  }
  return false;
}

export function validateMove(
  previousWord: string,
  nextWord: string,
): ValidationResult {
  const prev = normalizeInput(previousWord);
  const next = normalizeInput(nextWord);

  if (!next) {
    return { valid: false, reason: "Kelime boş olamaz." };
  }

  if (prev === next) {
    return { valid: false, reason: "Aynı kelimeyi tekrar giremezsiniz." };
  }

  if (prev.length !== next.length) {
    return {
      valid: false,
      reason: "Her adımda kelime uzunluğu aynı kalmalıdır.",
    };
  }

  if (countLetterDiff(prev, next) !== 1) {
    return {
      valid: false,
      reason: "Her adımda yalnızca bir harf değiştirebilirsiniz.",
    };
  }

  if (!isKnownWord(next)) {
    return {
      valid: false,
      reason: "Bu kelime oyun sözlüğünde bulunamadı.",
    };
  }

  if (looksLikeInflectedForm(next)) {
    return {
      valid: false,
      reason: "Ek eklenerek türetilmiş kelimeler kabul edilmez.",
    };
  }

  return { valid: true };
}

export function validateSolution(
  startWord: string,
  endWord: string,
  path: string[],
): ValidationResult {
  const normalizedPath = path.map(normalizeInput);
  const start = normalizeInput(startWord);
  const end = normalizeInput(endWord);

  if (normalizedPath.length < 2) {
    return { valid: false, reason: "Çözüm en az iki kelime içermelidir." };
  }

  if (normalizedPath[0] !== start) {
    return { valid: false, reason: "İlk kelime başlangıç kelimesi olmalıdır." };
  }

  if (normalizedPath[normalizedPath.length - 1] !== end) {
    return { valid: false, reason: "Son kelime hedef kelime olmalıdır." };
  }

  const seen = new Set<string>();
  for (const word of normalizedPath) {
    if (seen.has(word)) {
      return { valid: false, reason: "Aynı kelime tekrar kullanılamaz." };
    }
    seen.add(word);
  }

  for (let i = 1; i < normalizedPath.length; i++) {
    const result = validateMove(normalizedPath[i - 1], normalizedPath[i]);
    if (!result.valid) return result;
  }

  return { valid: true };
}
