import { toTurkishUpperCase } from "./word-input";
import type { ShareCardInput } from "@/components/ShareCard";

const COLORS = {
  bg: "#0f1419",
  surface: "#1a2332",
  border: "#2d3a4f",
  text: "#e2e8f0",
  muted: "#94a3b8",
  accent: "#3b82f6",
  orange: "#f97316",
  success: "#22c55e",
  tileIdle: "#2d3a4f",
};

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
    ctx.font = `700 ${Math.floor(tileSize * 0.42)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      toTurkishUpperCase(word[i]),
      tileX + tileSize / 2,
      y + tileSize / 2 + 1,
    );
  }
}

function drawMaskRow(
  ctx: CanvasRenderingContext2D,
  prev: string,
  next: string,
  x: number,
  y: number,
  tileSize: number,
  gap: number,
) {
  for (let i = 0; i < next.length; i++) {
    const changed = prev[i] !== next[i];
    const tileX = x + i * (tileSize + gap);
    roundRect(ctx, tileX, y, tileSize, tileSize, 10);
    ctx.fillStyle = changed ? COLORS.orange : COLORS.tileIdle;
    ctx.fill();
  }
}

export function createShareCardCanvas(input: ShareCardInput): HTMLCanvasElement {
  const wordLength = input.path[0]?.length ?? 4;
  const stepCount = Math.max(input.path.length - 1, 0);

  const width = 720;
  const outerInset = 24;
  const innerPadTop = 32;
  const innerPadBottom = 48;
  const tileSize = 72;
  const gap = 10;
  const rowGap = 14;
  const headerHeight = 110;
  const textGap = 28;
  const textLineHeight = 36;

  const boardWidth = wordLength * tileSize + (wordLength - 1) * gap;
  const boardX = (width - boardWidth) / 2;
  const rows = stepCount + 2;
  const boardHeight = rows * tileSize + (rows - 1) * rowGap;

  const innerHeight =
    innerPadTop + headerHeight + boardHeight + textGap + textLineHeight + innerPadBottom;
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
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.18)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
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
  ctx.font = "600 20px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("KELİME MERDİVENİ", width / 2, headerY + 24);

  ctx.fillStyle = COLORS.text;
  ctx.font = "700 42px Georgia, serif";
  ctx.fillText(`#${input.puzzleNumber}`, width / 2, headerY + 74);

  let y = headerY + headerHeight;
  const start = input.path[0] ?? "";
  const end = input.path[input.path.length - 1] ?? "";

  drawWordRow(
    ctx,
    start,
    boardX,
    y,
    tileSize,
    gap,
    "rgba(59, 130, 246, 0.2)",
    COLORS.accent,
  );
  y += tileSize + rowGap;

  for (let i = 0; i < stepCount; i++) {
    drawMaskRow(ctx, input.path[i], input.path[i + 1], boardX, y, tileSize, gap);
    y += tileSize + rowGap;
  }

  drawWordRow(
    ctx,
    end,
    boardX,
    y,
    tileSize,
    gap,
    "rgba(34, 197, 94, 0.2)",
    COLORS.success,
  );

  const boardBottom = headerY + headerHeight + boardHeight;
  const textY = boardBottom + textGap + textLineHeight / 2;

  ctx.fillStyle = COLORS.text;
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${input.steps} adımda tamamladım`, width / 2, textY);

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
