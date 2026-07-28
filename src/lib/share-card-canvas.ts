import { toTurkishUpperCase } from "./word-input";
import type { ShareCardInput } from "@/components/ShareCard";

const COLORS = {
  bg: "#0c1118",
  surface: "#1e293b",
  border: "#3b4c66",
  text: "#f1f5f9",
  muted: "#94a3b8",
  accent: "#60a5fa",
  success: "#34d399",
  orange: "#fb923c",
  stepFill: "rgba(96, 165, 250, 0.12)",
};

const FONT_BODY = "Inter, system-ui, sans-serif";
const FONT_DISPLAY = "Outfit, Inter, system-ui, sans-serif";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawWordRow(
  ctx: CanvasRenderingContext2D,
  word: string,
  x: number,
  y: number,
  tileSize: number,
  gap: number,
  fill: string,
  border: string,
) {
  for (let i = 0; i < word.length; i++) {
    const tileX = x + i * (tileSize + gap);
    roundRect(ctx, tileX, y, tileSize, tileSize, 10);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = COLORS.text;
    ctx.font = `700 ${Math.floor(tileSize * 0.42)}px ${FONT_DISPLAY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      toTurkishUpperCase(word[i]),
      tileX + tileSize / 2,
      y + tileSize / 2 + 1,
    );
  }
}

/** Spoiler’sız ara basamak — tüm kutular aynı. */
function drawStepRow(
  ctx: CanvasRenderingContext2D,
  length: number,
  x: number,
  y: number,
  tileSize: number,
  gap: number,
) {
  for (let i = 0; i < length; i++) {
    const tileX = x + i * (tileSize + gap);
    roundRect(ctx, tileX, y, tileSize, tileSize, 10);
    ctx.fillStyle = COLORS.stepFill;
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function createShareCardCanvas(input: ShareCardInput): HTMLCanvasElement {
  const start = input.path[0] ?? "";
  const end = input.path[input.path.length - 1] ?? "";
  const wordLength = start.length || end.length || 4;
  const stepCount = Math.max(input.steps - 1, 0);

  const width = 720;
  const outerInset = 24;
  const innerPadTop = 32;
  const innerPadBottom = 40;
  const tileSize = 72;
  const gap = 10;
  const rowGap = 14;
  const headerHeight = 110;
  const footerHeight = 48;

  const boardWidth = wordLength * tileSize + (wordLength - 1) * gap;
  const boardX = (width - boardWidth) / 2;
  const rows = stepCount + 2;
  const boardHeight = rows * tileSize + (rows - 1) * rowGap;

  const innerHeight =
    innerPadTop + headerHeight + boardHeight + footerHeight + innerPadBottom;
  const height = outerInset * 2 + innerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    width / 2,
    0,
    20,
    width / 2,
    120,
    420,
  );
  gradient.addColorStop(0, "rgba(96, 165, 250, 0.22)");
  gradient.addColorStop(1, "rgba(96, 165, 250, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 360);

  roundRect(ctx, outerInset, outerInset, width - outerInset * 2, innerHeight, 28);
  ctx.fillStyle = COLORS.surface;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  const headerY = outerInset + innerPadTop;
  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 20px ${FONT_BODY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("KELİME MERDİVENİ", width / 2, headerY + 24);

  ctx.fillStyle = COLORS.text;
  ctx.font = `700 42px ${FONT_DISPLAY}`;
  ctx.fillText(`#${input.puzzleNumber}`, width / 2, headerY + 74);

  let y = headerY + headerHeight;

  drawWordRow(
    ctx,
    start,
    boardX,
    y,
    tileSize,
    gap,
    "rgba(96, 165, 250, 0.25)",
    COLORS.accent,
  );
  y += tileSize + rowGap;

  for (let i = 0; i < stepCount; i++) {
    drawStepRow(ctx, wordLength, boardX, y, tileSize, gap);
    y += tileSize + rowGap;
  }

  drawWordRow(
    ctx,
    end,
    boardX,
    y,
    tileSize,
    gap,
    "rgba(52, 211, 153, 0.25)",
    COLORS.success,
  );
  y += tileSize;

  const showStreak = typeof input.streak === "number" && input.streak >= 2;
  const safeHints = Math.max(input.hints ?? 0, 0);

  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 22px ${FONT_BODY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const footerY = y + 34;
  const stepsText = String(input.steps);
  const hintSuffix = safeHints > 0 ? ` + ${safeHints}` : "";
  const adimText = " adım";
  const streakSuffix = showStreak ? ` · 🔥 ${input.streak} gün seri` : "";
  const fullText = `${stepsText}${hintSuffix}${adimText}${streakSuffix}`;
  const fullWidth = ctx.measureText(fullText).width;
  let cursorX = width / 2 - fullWidth / 2;

  ctx.fillStyle = COLORS.muted;
  ctx.textAlign = "left";
  ctx.fillText(stepsText, cursorX, footerY);
  cursorX += ctx.measureText(stepsText).width;

  if (safeHints > 0) {
    ctx.fillStyle = COLORS.orange;
    ctx.fillText(hintSuffix, cursorX, footerY);
    cursorX += ctx.measureText(hintSuffix).width;
  }

  ctx.fillStyle = COLORS.muted;
  ctx.fillText(`${adimText}${streakSuffix}`, cursorX, footerY);

  return canvas;
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Görsel oluşturulamadı."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}
