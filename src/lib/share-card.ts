import html2canvas from "html2canvas";
import type { ShareCardInput } from "@/components/ShareCard";
import { canvasToBlob, createShareCardCanvas } from "./share-card-canvas";

function getCaptureScale(): number {
  if (typeof window === "undefined") return 1;
  return window.innerWidth < 768 ? 1 : 2;
}

async function captureShareCardBlob(
  element: HTMLElement,
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: "#0c1118",
    scale: getCaptureScale(),
    useCORS: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  return canvasToBlob(canvas);
}

function shouldPreferCanvasCapture(): boolean {
  if (typeof window === "undefined") return true;
  return window.innerWidth < 768 || "ontouchstart" in window;
}

export async function createShareCardBlob(
  element: HTMLElement | null,
  input: ShareCardInput,
): Promise<Blob> {
  if (shouldPreferCanvasCapture() || !element) {
    return canvasToBlob(createShareCardCanvas(input));
  }

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    return await captureShareCardBlob(element);
  } catch {
    return canvasToBlob(createShareCardCanvas(input));
  }
}

export function createShareFile(blob: Blob, puzzleNumber: number): File {
  return new File([blob], `kelime-merdiveni-${puzzleNumber}.png`, {
    type: "image/png",
  });
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Önizleme oluşturulamadı."));
    reader.readAsDataURL(blob);
  });
}
