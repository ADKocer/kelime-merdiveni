/** Türkçe QWERTY klavye düzeni (küçük harf). */
export const TURKISH_QWERTY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "ı", "o", "p", "ğ", "ü"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ş", "i"],
  ["z", "x", "c", "v", "b", "n", "m", "ö", "ç"],
] as const;

/** Mobilde daha az sütun — tuşlar geniş ve dokunması kolay. */
export const TURKISH_QWERTY_ROWS_MOBILE = [
  ["q", "w", "e", "r", "t", "y", "u", "ı", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ş", "i"],
  ["z", "x", "c", "v", "b", "n", "m", "ö", "ç", "ğ", "ü"],
] as const;

export const TURKISH_ROW_GRID_COLS = {
  desktop: [12, 11, 9],
  mobile: [10, 11, 11],
} as const;
