import { toTurkishUpperCase } from "./word-input";

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

/** Her adımda hangi harf konumunun değiştiğini spoilersız gösterir. */
export function buildStepMasks(path: string[]): string[] {
  const masks: string[] = [];

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const next = path[i];
    let row = "";

    for (let j = 0; j < next.length; j++) {
      row += prev[j] === next[j] ? "⬛" : "🟧";
    }

    masks.push(row);
  }

  return masks;
}

export function buildShareText({
  puzzleNumber,
  path,
  steps,
}: ShareScoreInput): string {
  const start = path[0] ? toTurkishUpperCase(path[0]) : "";
  const end = path[path.length - 1]
    ? toTurkishUpperCase(path[path.length - 1])
    : "";
  const masks = buildStepMasks(path);

  return [
    `Kelime Merdiveni #${puzzleNumber} 🪜`,
    start,
    ...masks,
    end,
    `${steps} adımda bitirdim — sen daha az adımla yapabilir misin?`,
    "",
    SHARE_SITE,
    "#KelimeMerdiveni",
  ]
    .filter(Boolean)
    .join("\n");
}

export function getShareLinks(input: ShareScoreInput) {
  const text = buildShareText(input);
  const url = getShareUrl(input.gameUrl);
  const title = `Kelime Merdiveni #${input.puzzleNumber} — ${input.steps} adım`;

  return {
    text,
    url,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    reddit: `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
  };
}
