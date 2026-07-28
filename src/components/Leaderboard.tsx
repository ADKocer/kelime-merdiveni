"use client";

import { useEffect, useState } from "react";

import { ScoreLabel } from "@/components/ScoreLabel";

interface LeaderboardProps {
  refreshKey: number;
  modal?: boolean;
  onDateChange?: (date: string | null) => void;
}

interface LeaderboardEntry {
  id: number;
  playerName: string;
  steps: number;
  hints: number;
  completedAt: string;
}

interface LeaderboardResponse {
  date: string;
  entries: LeaderboardEntry[];
  error?: string;
}

export function Leaderboard({
  refreshKey,
  modal = false,
  onDateChange,
}: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setLoading(true);
      try {
        const response = await fetch("/api/leaderboard");
        const payload = (await response.json()) as LeaderboardResponse;
        if (!response.ok) {
          throw new Error(payload.error ?? "Onur tablosu yüklenemedi.");
        }
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Onur tablosu yüklenemedi.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const formattedDate = data?.date
    ? (() => {
        const [year, month, day] = data.date.split("-");
        return `${day}.${month}.${year}`;
      })()
    : "";

  useEffect(() => {
    if (!modal || !onDateChange) return;
    onDateChange(formattedDate || null);
  }, [formattedDate, modal, onDateChange]);

  if (modal) {
    return (
      <div className="min-w-0">
        {loading && (
          <p className="text-sm text-ladder-muted">Onur tablosu yükleniyor...</p>
        )}

        {error && <p className="text-sm text-red-300">{error}</p>}

        {!loading && !error && data && data.entries.length === 0 && (
          <p className="text-sm text-ladder-muted">
            Henüz skor yok. İlk siz tamamlayın!
          </p>
        )}

        {!loading && !error && data && data.entries.length > 0 && (
          <ol className="space-y-2">
            {data.entries.map((entry, index) => (
              <li
                key={entry.id}
                className="rounded-xl border border-ladder-border bg-ladder-surface px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ladder-border text-xs text-ladder-muted">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{entry.playerName}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-ladder-accent/30 px-2.5 py-0.5 text-sm font-semibold text-ladder-accent">
                    <ScoreLabel steps={entry.steps} hints={entry.hints} />
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  return (
    <aside className="min-w-0 overflow-x-hidden rounded-2xl border border-ladder-border bg-ladder-surface p-4 shadow-xl shadow-black/30 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold sm:text-xl">Günlük Onur Tablosu</h2>
        {formattedDate && (
          <p className="text-xs text-ladder-muted sm:text-sm">{formattedDate}</p>
        )}
      </div>

      {loading && (
        <p className="text-sm text-ladder-muted">Onur tablosu yükleniyor...</p>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}

      {!loading && !error && data && data.entries.length === 0 && (
        <p className="text-sm text-ladder-muted">
          Henüz skor yok. İlk siz tamamlayın!
        </p>
      )}

      {!loading && !error && data && data.entries.length > 0 && (
        <ol className="space-y-3">
          {data.entries.map((entry, index) => (
            <li
              key={entry.id}
              className="rounded-xl border border-ladder-border bg-ladder-surface px-3 py-2.5 sm:px-4 sm:py-3"
            >
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ladder-border text-sm text-ladder-muted">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{entry.playerName}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-ladder-accent/30 px-3 py-1 text-sm font-semibold text-ladder-accent">
                  <ScoreLabel steps={entry.steps} hints={entry.hints} />
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
