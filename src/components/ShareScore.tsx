"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  blobToDataUrl,
  createShareCardBlob,
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const openShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden rounded-xl border border-ladder-border bg-ladder-bg/60 p-3 sm:p-4">
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
          className="mb-4 w-full rounded-lg border border-ladder-border"
        />
      ) : (
        <p className="mb-4 text-xs text-ladder-muted">
          Önizleme hazırlanıyor…
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => openShare(links.x)}
          className="w-full rounded-lg border border-ladder-border bg-ladder-surface px-4 py-3 text-sm font-medium text-ladder-text transition hover:border-ladder-text"
        >
          X’te paylaş
        </button>
        <button
          type="button"
          onClick={() => openShare(links.whatsapp)}
          className="w-full rounded-lg border border-ladder-success/50 bg-ladder-success/15 px-4 py-3 text-sm font-medium text-ladder-success transition hover:bg-ladder-success/25"
        >
          WhatsApp’ta paylaş
        </button>
      </div>
    </div>
  );
}
