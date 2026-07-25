export const SHARE_SITE = "kelimemerdiveni.com";

export interface ShareScoreInput {
  puzzleNumber: number;
  path: string[];
  steps: number;
  gameUrl?: string;
}

function getShareUrl(gameUrl?: string): string {
  return gameUrl ?? `https://${SHARE_SITE}`;
}

export function buildShareText({
  puzzleNumber,
}: Pick<ShareScoreInput, "puzzleNumber">): string {
  const url = getShareUrl();

  return [
    `Kelime Merdiveni #${puzzleNumber} 🪜`,
    "",
    "Sen daha az adımla yapabilecek misin?",
    "",
    `Buradan oyna: ${url}`,
  ].join("\n");
}

export function getShareLinks(input: ShareScoreInput) {
  const text = buildShareText(input);
  const url = getShareUrl(input.gameUrl);
  const title = `Kelime Merdiveni #${input.puzzleNumber}`;

  return {
    text,
    url,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    reddit: `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
  };
}
