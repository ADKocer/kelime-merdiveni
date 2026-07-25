"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isHintUsed, markHintUsed } from "@/lib/hint-storage";
import {
  buildDayRecord,
  getDayRecords,
  markDayCompleted,
  saveDayRecords,
  type DayRecord,
} from "@/lib/player-history";
import {
  sanitizeWordInput,
  TURKISH_LETTER,
  toTurkishUpperCase,
} from "@/lib/word-input";
import { DailyCountdown } from "./DailyCountdown";
import { LeaderboardModal } from "./LeaderboardModal";
import { ProgressCalendar } from "./ProgressCalendar";
import { ShareScore } from "./ShareScore";
import { ThemeToggle } from "./ThemeToggle";
import { TurkishKeyboard } from "./TurkishKeyboard";
import { WordInputTiles } from "./WordInputTiles";
import { WordRow } from "./WordRow";

interface PuzzleResponse {
  date: string;
  todayKey: string;
  startWord: string;
  endWord: string;
  wordLength: number;
  puzzleNumber: number;
  isToday: boolean;
  sessionPath?: string[];
  hintUsed?: boolean;
  claimedPlayerName?: string | null;
}

interface ValidateResponse {
  valid: boolean;
  reason?: string;
  path?: string[];
  completed?: boolean;
}

interface HintResponse {
  position: number;
  error?: string;
}

type Screen = "home" | "play";

const PLAYER_NAME_KEY = "kelime-merdiveni-player-name";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function GameBoard() {
  const [screen, setScreen] = useState<Screen>("home");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activePuzzleDate, setActivePuzzleDate] = useState<string | null>(null);
  const [puzzle, setPuzzle] = useState<PuzzleResponse | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [dayRecords, setDayRecords] = useState<Record<string, DayRecord>>(() => {
    if (typeof window === "undefined") return {};
    return getDayRecords();
  });
  const [hintUsed, setHintUsed] = useState(false);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [optimalSteps, setOptimalSteps] = useState<number | null>(null);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(PLAYER_NAME_KEY);
      if (savedName) setPlayerName(savedName);
    } catch {
      // localStorage kullanılamıyorsa sessizce devam et
    }
  }, []);

  useEffect(() => {
    const records = getDayRecords();
    setDayRecords(records);
    saveDayRecords(records);
  }, []);

  const refreshDayRecords = useCallback(() => {
    const records = getDayRecords();
    setDayRecords(records);
    setHistoryVersion((value) => value + 1);
    return records;
  }, []);

  const fetchOptimal = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/optimal?date=${encodeURIComponent(date)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { optimalSteps?: number };
      if (typeof data.optimalSteps === "number") {
        setOptimalSteps(data.optimalSteps);
        const existing = getDayRecords()[date];
        if (existing?.path && existing.path.length > 1) {
          const record =
            markDayCompleted(
              date,
              existing.steps,
              existing.path,
              data.optimalSteps,
            ) ??
            buildDayRecord(
              date,
              existing.steps,
              existing.path,
              data.optimalSteps,
            );
          setDayRecords((current) => ({ ...current, [date]: record }));
          setHistoryVersion((value) => value + 1);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPuzzle() {
      setLoading(true);
      setError(null);
      try {
        const url = activePuzzleDate
          ? `/api/puzzle?date=${encodeURIComponent(activePuzzleDate)}`
          : "/api/puzzle";
        const response = await fetch(url, { credentials: "include" });
        const data = (await response.json()) as PuzzleResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Merdiven yüklenemedi.");
        }

        if (!cancelled) {
          setPuzzle(data);
          setInput("");
          setMessage(null);
          setHintIndex(null);
          setHintUsed(data.hintUsed ?? isHintUsed(data.date));
          setOptimalSteps(null);

          if (data.claimedPlayerName) {
            setPlayerName(data.claimedPlayerName);
            try {
              localStorage.setItem(PLAYER_NAME_KEY, data.claimedPlayerName);
            } catch {
              // localStorage kullanılamıyorsa sessizce devam et
            }
          }

          const sessionPath = data.sessionPath;
          if (sessionPath && sessionPath.length > 1) {
            setPath(sessionPath);
            if (sessionPath[sessionPath.length - 1] === data.endWord) {
              setCompleted(true);
              void fetchOptimal(data.date);
            } else {
              setCompleted(false);
            }
          } else {
            const record = getDayRecords()[data.date];
            if (record?.path && record.path.length > 1) {
              setPath(record.path);
              setCompleted(true);
              setOptimalSteps(record.optimalSteps ?? null);
            } else {
              setPath([data.startWord]);
              setCompleted(false);
            }
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Merdiven yüklenemedi.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPuzzle();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, activePuzzleDate, fetchOptimal]);

  const todayKey = puzzle?.todayKey ?? "";
  const stepCount = Math.max(path.length - 1, 0);
  const todayRecord = todayKey ? dayRecords[todayKey] : undefined;
  const todayCompleted = Boolean(todayRecord);

  const formattedDate = useMemo(() => {
    if (!puzzle) return "";
    const [year, month, day] = puzzle.date.split("-");
    return `${day}.${month}.${year}`;
  }, [puzzle]);

  const handleDayChange = useCallback(() => {
    setScreen("home");
    setActivePuzzleDate(null);
    refreshDayRecords();
    setRefreshKey((value) => value + 1);
  }, [refreshDayRecords]);

  const openPlay = useCallback((dateKey?: string) => {
    if (dateKey) {
      setActivePuzzleDate(dateKey);
    } else {
      setActivePuzzleDate(null);
    }
    setScreen("play");
    setError(null);
    scrollToTop();
  }, []);

  const openLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, []);

  const closeLeaderboard = useCallback(() => {
    setShowLeaderboard(false);
  }, []);

  const goHome = useCallback(() => {
    setScreen("home");
    setActivePuzzleDate(null);
    setError(null);
    refreshDayRecords();
    setRefreshKey((value) => value + 1);
    scrollToTop();
  }, [refreshDayRecords]);

  const submitWord = useCallback(async () => {
    if (!puzzle || completed || screen !== "play") return;

    const trimmed = input.trim();
    if (trimmed.length !== puzzle.wordLength) {
      setError(`${puzzle.wordLength} harfli bir kelime girin.`);
      return;
    }

    setError(null);
    setMessage(null);

    const response = await fetch("/api/validate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nextWord: trimmed }),
    });

    const result = (await response.json()) as ValidateResponse;
    if (!result.valid) {
      setError(result.reason ?? "Geçersiz hamle.");
      return;
    }

    const nextPath = result.path ?? path;
    setPath(nextPath);
    setInput("");

    if (result.completed) {
      const finalSteps = nextPath.length - 1;
      const record =
        markDayCompleted(
          puzzle.date,
          finalSteps,
          nextPath,
          optimalSteps ?? undefined,
        ) ??
        buildDayRecord(
          puzzle.date,
          finalSteps,
          nextPath,
          optimalSteps ?? undefined,
        );
      setDayRecords((current) => ({ ...current, [puzzle.date]: record }));
      setHistoryVersion((value) => value + 1);
      setCompleted(true);
      setMessage("Tebrikler! Hedefe ulaştınız.");
      void fetchOptimal(puzzle.date);
    } else {
      setHintIndex(null);
    }
  }, [completed, fetchOptimal, input, optimalSteps, path, puzzle, screen]);

  const appendLetter = useCallback(
    (letter: string) => {
      if (!puzzle || completed || screen !== "play") return;
      setInput((current) =>
        sanitizeWordInput(current + letter, puzzle.wordLength),
      );
      setError(null);
    },
    [completed, puzzle, screen],
  );

  const removeLetter = useCallback(() => {
    if (completed || screen !== "play") return;
    setInput((current) => current.slice(0, -1));
    setError(null);
  }, [completed, screen]);

  useEffect(() => {
    if (!puzzle || completed || screen !== "play") return;

    const handlePhysicalKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        removeLetter();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        void submitWord();
        return;
      }

      if (event.key.length === 1 && TURKISH_LETTER.test(event.key)) {
        event.preventDefault();
        appendLetter(event.key);
      }
    };

    window.addEventListener("keydown", handlePhysicalKey);
    return () => window.removeEventListener("keydown", handlePhysicalKey);
  }, [appendLetter, completed, puzzle, removeLetter, screen, submitWord]);

  const undoLast = async () => {
    if (path.length <= 1 || completed) return;

    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/undo", {
        method: "POST",
        credentials: "include",
      });
      const data = (await response.json()) as {
        path?: string[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Geri alma başarısız.");
      }
      if (data.path) setPath(data.path);
      setHintIndex(null);
    } catch (undoError) {
      setError(
        undoError instanceof Error
          ? undoError.message
          : "Geri alma başarısız.",
      );
    }
  };

  const requestHint = async () => {
    if (!puzzle || completed || hintUsed || hintLoading) return;

    setHintLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hint", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = (await response.json()) as HintResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "İpucu alınamadı.");
      }

      markHintUsed(puzzle.date);
      setHintUsed(true);
      setHintIndex(data.position - 1);
    } catch (hintError) {
      setError(
        hintError instanceof Error ? hintError.message : "İpucu alınamadı.",
      );
    } finally {
      setHintLoading(false);
    }
  };

  const saveScore = async () => {
    if (!puzzle || !completed || !puzzle.isToday) return;

    const name = playerName.trim();
    if (name.length < 2) {
      setError("Skor kaydı için en az 2 karakterlik bir ad girin.");
      return;
    }

    try {
      localStorage.setItem(PLAYER_NAME_KEY, name);
    } catch {
      // localStorage kullanılamıyorsa skor yine kaydedilir
    }
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: name,
          puzzleDate: puzzle.date,
        }),
      });

      const data = (await response.json()) as {
        saved?: boolean;
        updated?: boolean;
        message?: string;
        error?: string;
        steps?: number;
        optimalSteps?: number;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Skor kaydedilemedi.");
      }

      if (typeof data.optimalSteps === "number") {
        setOptimalSteps(data.optimalSteps);
        const existing = getDayRecords()[puzzle.date];
        if (existing?.path) {
          const record =
            markDayCompleted(
              puzzle.date,
              existing.steps,
              existing.path,
              data.optimalSteps,
            ) ??
            buildDayRecord(
              puzzle.date,
              existing.steps,
              existing.path,
              data.optimalSteps,
            );
          setDayRecords((current) => ({
            ...current,
            [puzzle.date]: record,
          }));
          setHistoryVersion((value) => value + 1);
        }
      }

      if (data.saved) {
        setMessage(
          data.updated
            ? `Skorunuz ${data.steps} adıma güncellendi!`
            : `${data.steps} adımla onur tablosuna eklendiniz!`,
        );
      } else {
        setMessage(data.message ?? "Skor kaydedilmedi.");
      }

      setRefreshKey((value) => value + 1);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Skor kaydedilemedi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-ladder-border bg-ladder-surface p-8 text-center">
        Günlük merdiven yükleniyor...
      </div>
    );
  }

  if (error && !puzzle) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-ladder-surface p-8 text-center text-red-600 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="rounded-2xl border border-ladder-border bg-ladder-surface p-8 text-center text-ladder-muted">
        Merdiven yüklenemedi. Sayfayı yenileyin.
      </div>
    );
  }

  if (screen === "home") {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-x-hidden sm:gap-4">
        <header className="shrink-0 text-center">
          <div className="mb-2 flex justify-end">
            <ThemeToggle />
          </div>
          <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-ladder-muted sm:text-sm sm:tracking-[0.35em]">
            Günlük Türkçe Kelime Oyunu
          </p>
          <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl">
            Kelime Merdiveni
          </h1>
        </header>

        <section className="rounded-2xl border border-ladder-border bg-ladder-surface p-4 shadow-xl shadow-black/10 dark:shadow-black/20 sm:p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs text-ladder-muted sm:text-sm">
                Bugünün merdiveni
              </p>
              <p className="text-lg font-semibold sm:text-xl">
                Merdiven #{puzzle.puzzleNumber}
              </p>
              <p className="text-sm text-ladder-muted">{formattedDate}</p>
            </div>
            <DailyCountdown
              puzzleDate={puzzle.date}
              onDayChange={handleDayChange}
            />
          </div>

          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-ladder-border/70 bg-ladder-bg/40 px-3 py-3 sm:gap-3 sm:py-4">
            <span className="font-display text-lg tracking-[0.12em] sm:text-2xl sm:tracking-[0.2em]">
              {toTurkishUpperCase(puzzle.startWord)}
            </span>
            <span className="text-ladder-muted">→</span>
            <span className="font-display text-lg tracking-[0.12em] sm:text-2xl sm:tracking-[0.2em]">
              {toTurkishUpperCase(puzzle.endWord)}
            </span>
          </div>

          {todayCompleted && (
            <p className="mb-3 text-center text-sm text-ladder-success">
              Bugünkü merdiveni tamamladınız · {todayRecord?.steps ?? 0} adım
              {todayRecord?.status === "late" ? " (geç)" : ""}
            </p>
          )}

          <button
            type="button"
            onClick={() => openPlay()}
            className="w-full rounded-xl bg-ladder-accent py-3.5 text-base font-semibold text-white transition active:scale-[0.98] active:bg-blue-500 sm:py-4 sm:text-lg"
          >
            {todayCompleted ? "Sonucu gör" : "Oyuna başla"}
          </button>
        </section>

        <button
          type="button"
          onClick={openLeaderboard}
          className="w-full rounded-xl border border-ladder-border bg-ladder-surface py-3.5 text-base font-medium text-ladder-text transition active:scale-[0.98] hover:border-ladder-text sm:py-4"
        >
          Onur tablosu
        </button>

        <ProgressCalendar
          refreshKey={historyVersion}
          todayKey={todayKey}
          records={dayRecords}
          onSelectDate={(dateKey) => openPlay(dateKey)}
        />

        <LeaderboardModal
          open={showLeaderboard}
          onClose={closeLeaderboard}
          refreshKey={refreshKey}
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      <div className="mb-3 flex items-center gap-2 sm:mb-4">
        <button
          type="button"
          onClick={goHome}
          className="shrink-0 rounded-lg border border-ladder-border px-3 py-2 text-sm text-ladder-muted transition hover:border-ladder-text hover:text-ladder-text"
        >
          ← Ana sayfa
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs text-ladder-muted sm:text-sm">
            Merdiven #{puzzle.puzzleNumber} · {formattedDate}
          </p>
          <p className="text-sm font-medium sm:text-base">{stepCount} adım</p>
          {!puzzle.isToday && (
            <p className="text-xs text-ladder-orange">Geçmiş merdiven</p>
          )}
        </div>
        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>

      <section className="min-w-0 overflow-x-hidden rounded-2xl border border-ladder-border bg-ladder-surface p-3 shadow-xl shadow-black/10 dark:shadow-black/20 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <WordRow
              word={puzzle.startWord}
              label="Başlangıç"
              highlight="start"
              hintIndex={path.length === 1 ? hintIndex : null}
            />
          </div>
          <div
            className="text-center text-lg text-ladder-muted sm:text-2xl"
            aria-hidden="true"
          >
            <span className="sm:hidden">↓</span>
            <span className="hidden sm:inline">→</span>
          </div>
          <div className="min-w-0 flex-1">
            <WordRow
              word={puzzle.endWord}
              label="Hedef"
              highlight={completed ? "end" : "goal"}
            />
          </div>
        </div>

        <div className="mb-4 grid gap-2 sm:mb-5 sm:gap-3">
          {path.slice(1).map((word, index) => (
            <WordRow
              key={`${word}-${index + 1}`}
              word={word}
              label={`#${index + 1}`}
              highlight={
                index === path.length - 2 && completed ? "end" : "step"
              }
              hintIndex={
                hintIndex !== null && index === path.length - 2
                  ? hintIndex
                  : null
              }
            />
          ))}

          {!completed && (
            <div className="animate-pop-in rounded-xl border border-dashed border-ladder-border p-3 sm:p-4">
              <label className="mb-3 block text-center text-sm text-ladder-muted">
                Sıradaki kelime ({puzzle.wordLength} harf)
              </label>
              <WordInputTiles
                value={input}
                length={puzzle.wordLength}
                hintIndex={hintIndex}
              />
              <div className="-mx-3 mt-4 sm:mx-0">
                <TurkishKeyboard
                  onKey={appendLetter}
                  onBackspace={removeLetter}
                  onEnter={() => void submitWord()}
                  canEnter={input.length === puzzle.wordLength}
                />
              </div>
            </div>
          )}
        </div>

        {(error || message) && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              error
                ? "border border-red-500/45 bg-red-500/15 text-red-700 dark:text-red-200"
                : "border border-green-500/45 bg-green-500/15 text-green-800 dark:text-green-200"
            }`}
          >
            {error ?? message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!completed && (
            <>
              <button
                type="button"
                onClick={() => void undoLast()}
                disabled={path.length <= 1}
                className="rounded-lg border border-ladder-border px-4 py-2 text-sm text-ladder-muted transition hover:border-ladder-text hover:text-ladder-text disabled:cursor-not-allowed disabled:opacity-40"
              >
                Geri al
              </button>
              <button
                type="button"
                onClick={() => void requestHint()}
                disabled={hintUsed || hintLoading}
                className="rounded-lg border border-ladder-orange/70 bg-ladder-orange/15 px-4 py-2 text-sm font-medium text-ladder-orange transition hover:bg-ladder-orange/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {hintLoading
                  ? "İpucu alınıyor..."
                  : hintUsed
                    ? "İpucu kullanıldı"
                    : "İpucu (1 hak)"}
              </button>
            </>
          )}

          {completed && (
            <div className="flex w-full flex-col gap-3">
              {optimalSteps !== null && (
                <p className="text-center text-sm text-ladder-muted">
                  Mümkün olan en kısa yol {optimalSteps} adımdı.
                </p>
              )}

              <ShareScore
                puzzleNumber={puzzle.puzzleNumber}
                path={path}
                steps={stepCount}
              />

              {puzzle.isToday ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={playerName}
                      onChange={(event) => setPlayerName(event.target.value)}
                      placeholder="Onur tablosu için adınız"
                      maxLength={24}
                      readOnly={Boolean(puzzle.claimedPlayerName)}
                      className="min-w-0 flex-1 rounded-lg border border-ladder-border bg-ladder-bg px-4 py-2 outline-none ring-ladder-accent focus:ring-2 read-only:opacity-80"
                    />
                    <button
                      type="button"
                      onClick={saveScore}
                      disabled={submitting}
                      className="shrink-0 rounded-lg bg-ladder-success px-5 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60 dark:text-black dark:hover:bg-green-400"
                    >
                      {submitting ? "Kaydediliyor..." : "Skoru kaydet"}
                    </button>
                  </div>
                  <p className="text-xs text-ladder-muted">
                    {puzzle.claimedPlayerName
                      ? "Bu tarayıcıda kayıtlı isminle skorun güncellenir."
                      : "İsim bir kez alınır; başka biri aynı ismi kullanamaz."}
                  </p>
                </div>
              ) : (
                <p className="text-center text-xs text-ladder-muted">
                  Geçmiş merdivenler onur tablosuna yazılmaz.
                </p>
              )}

              <button
                type="button"
                onClick={goHome}
                className="rounded-lg border border-ladder-border px-4 py-2 text-sm text-ladder-muted transition hover:border-ladder-text hover:text-ladder-text"
              >
                Ana sayfaya dön
              </button>
            </div>
          )}
        </div>

        <details className="mt-4 rounded-xl border border-ladder-border/70 bg-ladder-bg/40 sm:mt-5">
          <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-ladder-text [&::-webkit-details-marker]:hidden">
            Kurallar
          </summary>
          <ul className="space-y-1 px-3 pb-2 text-sm text-ladder-muted">
            <li>Her adımda yalnızca 1 harf değişebilir.</li>
            <li>Kelime uzunluğu sabit kalmalıdır.</li>
            <li>Tüm kelimeler oyun sözlüğünde geçerli olmalıdır.</li>
            <li>Ek eklenerek türetilmiş kelimeler kabul edilmez.</li>
          </ul>
          <p className="mx-3 mb-3 rounded-lg border border-ladder-border/60 bg-ladder-bg/60 px-3 py-2 text-sm text-ladder-text">
            <span className="text-ladder-muted">Örnek: </span>
            <span className="tracking-[0.1em] sm:tracking-[0.2em]">
              {toTurkishUpperCase("koyu")} → {toTurkishUpperCase("konu")} →{" "}
              {toTurkishUpperCase("koni")}
            </span>
            <span className="text-ladder-muted"> (y-n, o-i)</span>
          </p>
        </details>
      </section>
    </div>
  );
}
