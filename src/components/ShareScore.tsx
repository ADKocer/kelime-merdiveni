"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  blobToDataUrl,
  createShareCardBlob,
  createShareFile,
} from "@/lib/share-card";
import { getShareLinks } from "@/lib/share-score";
import { ShareCard } from "./ShareCard";

interface ShareScoreProps {
  puzzleNumber: number;
  path: string[];
  steps: number;
}

export function ShareScore({ puzzleNumber, path, steps }: ShareScoreProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shareHint, setShareHint] = useState<string | null>(null);

  const gameUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  const cardInput = useMemo(
    () => ({ puzzleNumber, path, steps }),
    [path, puzzleNumber, steps],
  );

  const links = useMemo(
    () => getShareLinks({ puzzleNumber, path, steps, gameUrl }),
    [gameUrl, path, puzzleNumber, steps],
  );

  const showHint = (message: string) => {
    setShareHint(message);
    window.setTimeout(() => setShareHint(null), 4500);
  };

  const buildBlob = useCallback(async () => {
    return createShareCardBlob(captureRef.current, cardInput);
  }, [cardInput]);

  useEffect(() => {
    let cancelled = false;

    async function buildPreview() {
      try {
        const blob = await buildBlob();
        const dataUrl = await blobToDataUrl(blob);
        if (!cancelled) setPreviewUrl(dataUrl);
      } catch {
        if (!cancelled) setPreviewUrl(null);
      }
    }

    buildPreview();
    return () => {
      cancelled = true;
    };
  }, [buildBlob]);

  const copyImageToClipboard = async (blob: Blob) => {
    if (typeof ClipboardItem === "undefined") {
      throw new Error("ClipboardItem desteklenmiyor");
    }
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const shareWithNativeMenu = async (blob: Blob) => {
    if (!navigator.share) return false;

    const file = createShareFile(blob, puzzleNumber);
    const shareData: ShareData = {
      title: `Kelime Merdiveni #${puzzleNumber}`,
      files: [file],
    };

    try {
      if (navigator.canShare && !navigator.canShare(shareData)) {
        return false;
      }

      await navigator.share(shareData);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
      return false;
    }
  };

  const shareTextNative = async () => {
    if (!navigator.share) return false;
    await navigator.share({
      title: `Kelime Merdiveni #${puzzleNumber}`,
      text: links.text,
      url: links.url,
    });
    return true;
  };

  const handleShare = async () => {
    setSharing(true);
    setShareHint(null);

    if (typeof window !== "undefined" && !window.isSecureContext) {
      showHint(
        "Paylaşım için HTTPS gerekir. Görsele uzun basıp kaydedebilir veya metni kopyalayabilirsin.",
      );
      setSharing(false);
      return;
    }

    try {
      const blob = await buildBlob();

      if (await shareWithNativeMenu(blob)) return;

      try {
        await copyImageToClipboard(blob);
        showHint(
          "Görsel panoya kopyalandı. Sohbet veya gönderide yapıştırarak paylaş.",
        );
        return;
      } catch {
        // Panoya görsel kopyalanamadı
      }

      try {
        if (await shareTextNative()) return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }

      showHint("Paylaşılamadı. Metin kopyalamayı dene.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      showHint("Paylaşılamadı. Tekrar dene.");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(links.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showHint("Metin kopyalanamadı.");
    }
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden rounded-xl border border-ladder-border bg-ladder-bg/40 p-3 sm:p-4">
      <div
        ref={captureRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 -z-10 w-[720px] -translate-x-full"
      >
        <ShareCard {...cardInput} />
      </div>

      <p className="mb-1 font-medium text-ladder-text">Skorunu paylaş</p>

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={`Kelime Merdiveni #${puzzleNumber} skor kartı`}
          className="mb-4 w-full rounded-lg border border-ladder-border/60"
        />
      ) : (
        <p className="mb-4 text-xs text-ladder-muted">
          Önizleme hazırlanıyor… Paylaş’a basınca görsel oluşturulur.
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={sharing}
        className="mb-3 w-full rounded-lg border border-ladder-accent/70 bg-ladder-accent/15 px-4 py-3 text-sm font-medium text-ladder-accent transition hover:bg-ladder-accent/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sharing
          ? "Hazırlanıyor..."
          : copied
            ? "Panoya kopyalandı!"
            : "Paylaş"}
      </button>

      {shareHint && (
        <p className="mb-3 text-xs text-ladder-muted">{shareHint}</p>
      )}

      <details className="group">
        <summary className="cursor-pointer list-none text-xs text-ladder-muted transition hover:text-ladder-text [&::-webkit-details-marker]:hidden">
          <span className="underline-offset-2 group-open:underline">
            İstersen metin olarak da kopyala
          </span>
        </summary>

        <pre className="mt-3 mb-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-ladder-border/60 bg-ladder-bg/60 p-3 text-xs leading-relaxed text-ladder-muted">
          {links.text}
        </pre>

        <button
          type="button"
          onClick={() => void handleCopyText()}
          className="rounded-lg border border-ladder-border px-3 py-2 text-sm text-ladder-text transition hover:border-ladder-text"
        >
          Metni kopyala
        </button>
      </details>
    </div>
  );
}
