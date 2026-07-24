const TURKISH_LETTER = /[a-zA-ZçÇğĞıİöÖşŞüÜ]/;

export { TURKISH_LETTER };

export function normalizeInput(value: string): string {
  const map: Record<string, string> = { I: "ı", İ: "i" };
  return value
    .trim()
    .replace(/\s+/g, "")
    .split("")
    .map((char) => map[char] ?? char.toLowerCase())
    .join("");
}

/** Türkçe büyük harf: i→İ, ı→I (varsayılan toUpperCase i→I yapar). */
export function toTurkishUpperCase(value: string): string {
  return value.toLocaleUpperCase("tr");
}

export function sanitizeWordInput(value: string, maxLength: number): string {
  return value
    .split("")
    .filter((char) => TURKISH_LETTER.test(char))
    .join("")
    .slice(0, maxLength);
}
