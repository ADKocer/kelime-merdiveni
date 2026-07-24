const HINTS_USED_KEY = "kelime-merdiveni-hints-used";

function readHints(): Record<string, boolean> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(HINTS_USED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

function writeHints(hints: Record<string, boolean>): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(HINTS_USED_KEY, JSON.stringify(hints));
  } catch {
    // localStorage kullanılamıyorsa sessizce devam et
  }
}

/** Merdiven başına bir ipucu hakkı. */
export function isHintUsed(puzzleDate: string): boolean {
  return Boolean(readHints()[puzzleDate]);
}

export function markHintUsed(puzzleDate: string): void {
  const hints = readHints();
  hints[puzzleDate] = true;
  writeHints(hints);
}
