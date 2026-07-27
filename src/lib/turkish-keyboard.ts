/** Türkçe QWERTY klavye düzeni (küçük harf). */
export const TURKISH_QWERTY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "ı", "o", "p", "ğ", "ü"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ş", "i"],
  ["z", "x", "c", "v", "b", "n", "m", "ö", "ç"],
] as const;

/**
 * Mobil: q/w/x yok (oyun sözlüğünde kullanılmıyor), en fazla 8 tuş/satır.
 * Daha geniş dokunma alanı, yanlış basmayı azaltır.
 */
export const TURKISH_QWERTY_ROWS_MOBILE = [
  ["e", "r", "t", "y", "u", "ı", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k"],
  ["l", "ş", "i", "z", "c", "v", "b", "n"],
  ["m", "ö", "ç", "ğ", "ü"],
] as const;

export const TURKISH_ROW_GRID_COLS = {
  desktop: [12, 11, 9],
  mobile: [8, 8, 8, 5],
} as const;
