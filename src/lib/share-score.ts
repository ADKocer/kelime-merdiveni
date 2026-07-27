export const SHARE_SITE = "kelimemerdiveni.com";

export interface ShareScoreInput {
  puzzleNumber: number;
  path: string[];
  steps: number;
  gameUrl?: string;
  puzzleDate?: string;
  streak?: number;
}

function getBaseUrl(gameUrl?: string): string {
  return (gameUrl ?? `https://${SHARE_SITE}`).replace(/\/$/, "");
}

/** Belirli bir merdiveni açan düello (arkadaşını yen) linki. */
export function getDuelUrl(puzzleDate?: string, gameUrl?: string): string {
  const base = getBaseUrl(gameUrl);
  return puzzleDate ? `${base}/?merdiven=${puzzleDate}` : base;
}

/** Spoiler'sız emoji merdiven: başlangıç 🟦, ara ⬜, hedef 🟩. */
export function buildEmojiLadder(steps: number): string {
  const middle = Math.max(steps - 1, 0);
  return `🟦${"⬜".repeat(middle)}🟩`;
}

export function buildShareText({
  puzzleNumber,
  steps,
  puzzleDate,
  streak,
  gameUrl,
}: Omit<ShareScoreInput, "path">): string {
  const url = getDuelUrl(puzzleDate, gameUrl);
  const ladder = buildEmojiLadder(steps);
  const stepLabel = `${steps} adım`;
  const streakLabel =
    typeof streak === "number" && streak >= 2 ? ` · 🔥 ${streak} gün` : "";

  return [
    `Kelime Merdiveni #${puzzleNumber} 🪜`,
    "",
    `${ladder}  (${stepLabel}${streakLabel})`,
    "",
    "Sen daha az adımda inebilir misin?",
    "",
    url,
  ].join("\n");
}

export function getShareLinks(input: ShareScoreInput) {
  const text = buildShareText(input);
  const url = getDuelUrl(input.puzzleDate, input.gameUrl);
  const title = `Kelime Merdiveni #${input.puzzleNumber}`;

  return {
    text,
    url,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    reddit: `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
  };
}
