export type NameSanitizeResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

const ALLOWED_NAME = /^[\p{L}\p{N}]+(?: [\p{L}\p{N}]+)*$/u;

/** Kontrol karakterleri, RTL override ve fazla boşlukları temizler. */
export function sanitizePlayerName(raw: string | undefined): NameSanitizeResult {
  if (!raw) {
    return { ok: false, error: "Geçerli bir oyuncu adı girin (en az 2 karakter)." };
  }

  const cleaned = raw
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 2) {
    return { ok: false, error: "Geçerli bir oyuncu adı girin (en az 2 karakter)." };
  }

  if (cleaned.length > 24) {
    return { ok: false, error: "Oyuncu adı en fazla 24 karakter olabilir." };
  }

  if (!ALLOWED_NAME.test(cleaned)) {
    return {
      ok: false,
      error: "Oyuncu adı yalnızca harf, rakam ve boşluk içerebilir.",
    };
  }

  return { ok: true, name: cleaned };
}
