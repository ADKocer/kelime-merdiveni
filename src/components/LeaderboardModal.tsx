"use client";

import { useEffect, useState } from "react";
import { Leaderboard } from "./Leaderboard";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  refreshKey: number;
}

export function LeaderboardModal({
  open,
  onClose,
  refreshKey,
}: LeaderboardModalProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setFormattedDate(null);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Onur tablosunu kapat"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-modal-title"
        className="relative z-10 flex w-full max-w-md max-h-[min(85vh,36rem)] min-w-0 flex-col overflow-hidden rounded-2xl border border-ladder-border bg-ladder-surface shadow-2xl shadow-black/50"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ladder-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2
              id="leaderboard-modal-title"
              className="text-base font-semibold sm:text-lg"
            >
              Günlük Onur Tablosu
            </h2>
            {formattedDate && (
              <p className="text-xs text-ladder-muted sm:text-sm">{formattedDate}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ladder-border text-lg text-ladder-muted transition hover:border-ladder-text hover:text-ladder-text"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3 sm:px-5 sm:py-4">
          <Leaderboard
            refreshKey={refreshKey}
            modal
            onDateChange={setFormattedDate}
          />
        </div>
      </div>
    </div>
  );
}
