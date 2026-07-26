import type { ShareCardInput } from "@/components/ShareCard";
import { canvasToBlob, createShareCardCanvas } from "./share-card-canvas";

/**
 * html2canvas masaüstünde Outfit fontunu kutunun altına kaydırıyordu.
 * Mobildeki doğru canvas render her yerde kullanılıyor.
 */
export async function createShareCardBlob(
  _element: HTMLElement | null,
  input: ShareCardInput,
): Promise<Blob> {
  return canvasToBlob(createShareCardCanvas(input));
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
