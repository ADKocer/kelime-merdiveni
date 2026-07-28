"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildDayRecord,
  getCurrentStreak,
  getDayRecords,
  markDayCompleted,
  saveDayRecords,
  type DayRecord,
} from "@/lib/player-history";
import { GAME_LAUNCH_DATE, getIstanbulDateKey } from "@/lib/daily-clock";
import { formatScoreWithAdim } from "@/lib/score-display";
import {
  sanitizeWordInput,
  TURKISH_LETTER,
  toTurkishUpperCase,
} from "@/lib/word-input";
import { DailyCountdown } from "./DailyCountdown";
import { HowToPlay } from "./HowToPlay";
import { LeaderboardModal } from "./LeaderboardModal";
import { ProgressCalendar } from "./ProgressCalendar";
import { ScoreLabel } from "./ScoreLabel";
import { ShareScore } from "./ShareScore";
import { StepArrow } from "./StepArrow";
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
  hintCount?: number;
  claimedPlayerName?: string | null;
}

interface ValidateResponse {
  valid: boolean;
  reason?: string;
  error?: string;
  path?: string[];
  completed?: boolean;
}

interface HintResponse {
  position: number;
  hintCount?: number;
  error?: string;
}

type Screen = "home" | "play";

const PLAYER_NAME_KEY = "kelime-merdiveni-player-name";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function findChangedLetterIndex(prev: string, next: string): number | null {
  const len = Math.min(prev.length, next.length);
  for (let i = 0; i < len; i++) {
    if (prev[i] !== next[i]) return i;
  }
  return null;
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
  const [hintCount, setHintCount] = useState(0);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [optimalSteps, setOptimalSteps] = useState<number | null>(null);
  const [optimalPath, setOptimalPath] = useState<string[] | null>(null);
  const [showOptimal, setShowOptimal] = useState(false);
  const [optimalLoading, setOptimalLoading] = useState(false);
  const [optimalError, setOptimalError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(PLAYER_NAME_KEY);
      if (savedName) setPlayerName(savedName);
    } catch {
      // localStorage kullanılamıyorsa sessizce devam et
    }
  }, []);

  // Düello / arkadaşını yen linki: ?merdiven=YYYY-MM-DD ile o günü aç.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const dateParam = new URLSearchParams(window.location.search).get(
      "merdiven",
    );
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return;

    const today = getIstanbulDateKey();
    if (dateParam < GAME_LAUNCH_DATE || dateParam > today) return;

    setActivePuzzleDate(dateParam);
    setScreen("play");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#nasil-oynanir") {
      setScreen("home");
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

  const fetchOptimal = useCallback(async (date: string, pathProof?: string[]) => {
    setOptimalLoading(true);
    setOptimalError(null);
    try {
      const proof =
        pathProof && pathProof.length > 1
          ? pathProof
          : getDayRecords()[date]?.path;

      const res = await fetch("/api/optimal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          path: proof && proof.length > 1 ? proof : undefined,
        }),
      });

      const data = (await res.json()) as {
        optimalSteps?: number;
        optimalPath?: string[];
        error?: string;
      };

      if (!res.ok) {
        setOptimalError(data.error ?? "En hızlı çözüm alınamadı.");
        return;
      }

      if (typeof data.optimalSteps === "number") {
        setOptimalSteps(data.optimalSteps);
        if (Array.isArray(data.optimalPath) && data.optimalPath.length > 1) {
          setOptimalPath(data.optimalPath);
        }
        const existing = getDayRecords()[date];
        if (existing?.path && existing.path.length > 1) {
          const record =
            markDayCompleted(
              date,
              existing.steps,
              existing.path,
              data.optimalSteps,
              existing.hints ?? 0,
            ) ??
            buildDayRecord(
              date,
              existing.steps,
              existing.path,
              data.optimalSteps,
              existing.status,
              existing.hints ?? 0,
            );
          setDayRecords((current) => ({ ...current, [date]: record }));
          setHistoryVersion((value) => value + 1);
        }
      }
    } catch {
      setOptimalError("En hızlı çözüm alınamadı.");
    } finally {
      setOptimalLoading(false);
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
          setHintCount(data.hintCount ?? 0);
          setOptimalSteps(null);
          setOptimalPath(null);
          setShowOptimal(false);
          setOptimalLoading(false);
          setOptimalError(null);
          setCelebrate(false);

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
              void fetchOptimal(data.date, sessionPath);
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
  const currentStreak = useMemo(
    () => (todayKey ? getCurrentStreak(dayRecords, todayKey) : 0),
    [dayRecords, todayKey],
  );

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
      setShakeKey((value) => value + 1);
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
    if (!response.ok || !result.valid) {
      setError(
        result.reason ??
          result.error ??
          (response.status === 401
            ? "Oyun oturumu bulunamadı. Sayfayı yenile."
            : "Geçersiz hamle."),
      );
      setShakeKey((value) => value + 1);
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
          hintCount,
        ) ??
        buildDayRecord(
          puzzle.date,
          finalSteps,
          nextPath,
          optimalSteps ?? undefined,
          undefined,
          hintCount,
        );
      setDayRecords((current) => ({ ...current, [puzzle.date]: record }));
      setHistoryVersion((value) => value + 1);
      setCompleted(true);
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 1900);
      setMessage("Tebrikler! Hedefe ulaştınız.");
      void fetchOptimal(puzzle.date, nextPath);
    } else {
      setHintIndex(null);
    }
  }, [completed, fetchOptimal, hintCount, input, optimalSteps, path, puzzle, screen]);

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
    if (!puzzle || completed || hintLoading) return;

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

      if (typeof data.hintCount === "number") {
        setHintCount(data.hintCount);
      } else {
        setHintCount((value) => value + 1);
      }
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
          path,
        }),
      });

      const data = (await response.json()) as {
        saved?: boolean;
        updated?: boolean;
        message?: string;
        error?: string;
        steps?: number;
        hints?: number;
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
              existing.hints ?? hintCount,
            ) ??
            buildDayRecord(
              puzzle.date,
              existing.steps,
              existing.path,
              data.optimalSteps,
              existing.status,
              existing.hints ?? hintCount,
            );
          setDayRecords((current) => ({
            ...current,
            [puzzle.date]: record,
          }));
          setHistoryVersion((value) => value + 1);
        }
      }

      if (data.saved) {
        const scoreLabel = formatScoreWithAdim(
          data.steps ?? stepCount,
          data.hints ?? hintCount,
        );
        setMessage(
          data.updated
            ? `Skorunuz ${scoreLabel} olarak güncellendi!`
            : `${scoreLabel} ile onur tablosuna eklendiniz!`,
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
      <div className="animate-screen-in flex min-w-0 flex-1 flex-col gap-3 overflow-x-hidden sm:gap-4">
        <header className="shrink-0 text-center">
          <div className="mb-2 flex justify-end">
            <ThemeToggle />
          </div>
          <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl">
            Kelime Merdiveni
          </h1>
        </header>

        <section className="rounded-2xl border border-ladder-border bg-ladder-surface/95 p-4 shadow-xl shadow-black/15 backdrop-blur-[2px] dark:shadow-black/40 sm:p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs text-ladder-muted sm:text-sm">
                Bugünün merdiveni
              </p>
              <p className="text-lg font-semibold sm:text-xl">
                Merdiven #{puzzle.puzzleNumber}
              </p>
              <p className="text-sm text-ladder-muted">{formattedDate}</p>
              {currentStreak >= 1 && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-ladder-orange/50 bg-ladder-orange/15 px-2.5 py-1 text-xs font-semibold text-ladder-orange">
                  🔥 {currentStreak} günlük seri
                </p>
              )}
            </div>
            <DailyCountdown
              puzzleDate={puzzle.date}
              onDayChange={handleDayChange}
            />
          </div>

          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-ladder-border bg-ladder-bg/60 px-3 py-3 sm:gap-3 sm:py-4">
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
              Bugünkü merdiveni tamamladınız ·{" "}
              {formatScoreWithAdim(
                todayRecord?.steps ?? 0,
                todayRecord?.hints ?? 0,
              )}
              {todayRecord?.status === "late" ? " (geç)" : ""}
            </p>
          )}

          <button
            type="button"
            onClick={() => openPlay()}
            className="btn-cta w-full rounded-xl bg-ladder-accent py-3.5 text-base font-semibold text-white active:bg-blue-500 sm:py-4 sm:text-lg"
          >
            {todayCompleted ? "Sonucu gör" : "Oyuna başla"}
          </button>
        </section>

        <button
          type="button"
          onClick={openLeaderboard}
          className="btn-cta w-full rounded-xl border border-ladder-border bg-ladder-surface/95 py-3.5 text-base font-medium text-ladder-text backdrop-blur-[2px] hover:border-ladder-text sm:py-4"
        >
          Onur tablosu
        </button>

        <ProgressCalendar
          refreshKey={historyVersion}
          todayKey={todayKey}
          records={dayRecords}
          onSelectDate={(dateKey) => openPlay(dateKey)}
        />

        <HowToPlay />

        <LeaderboardModal
          open={showLeaderboard}
          onClose={closeLeaderboard}
          refreshKey={refreshKey}
        />
      </div>
    );
  }

  return (
    <div className="animate-screen-in flex min-w-0 flex-1 flex-col overflow-x-hidden">
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
          <p className="text-sm font-medium sm:text-base">
            <ScoreLabel steps={stepCount} hints={hintCount} />
            <span className="text-ladder-muted"> adım</span>
          </p>
          {!puzzle.isToday && (
            <p className="text-xs text-ladder-orange">Geçmiş merdiven</p>
          )}
        </div>
        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>

      <section className="min-w-0 overflow-x-hidden rounded-2xl border border-ladder-border bg-ladder-surface/95 p-3 shadow-xl shadow-black/15 backdrop-blur-[2px] dark:shadow-black/40 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:gap-3">
          <WordRow
            word={puzzle.startWord}
            label="Başlangıç"
            highlight="start"
            hintIndex={path.length === 1 ? hintIndex : null}
            animateIn={false}
          />

          {path.slice(1).map((word, index) => {
            const isLast = index === path.length - 2;
            const previousWord = path[index] ?? puzzle.startWord;
            const changedIndex = findChangedLetterIndex(previousWord, word);

            return (
              <div key={`${word}-${index + 1}`} className="contents">
                <StepArrow />
                <WordRow
                  word={word}
                  label={`#${index + 1}`}
                  highlight={completed && isLast ? "end" : "step"}
                  hintIndex={
                    hintIndex !== null && !completed && isLast ? hintIndex : null
                  }
                  changedIndex={changedIndex}
                  animateIn={isLast}
                  celebrate={completed && isLast && celebrate}
                  glowAllLetters={completed && isLast}
                />
              </div>
            );
          })}

          {!completed && (
            <>
              <StepArrow />
              <WordRow
                word={puzzle.endWord}
                label="Hedef"
                highlight="goal"
                animateIn={false}
              />
            </>
          )}
        </div>

        {!completed && (
          <div
            key={shakeKey}
            className={`mb-4 rounded-xl border border-dashed border-ladder-border p-3 sm:mb-5 sm:p-4 ${
              shakeKey > 0 ? "animate-shake" : "animate-pop-in"
            }`}
          >
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

        {(error || message) && (
          <div
            key={error ? `err-${shakeKey}` : "msg"}
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              error
                ? "animate-shake border border-red-500/60 bg-red-500/20 text-red-700 dark:text-red-200"
                : "animate-pop-in border border-green-500/60 bg-green-500/20 text-green-800 dark:text-green-200"
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
                disabled={hintLoading}
                className="rounded-lg border border-ladder-hint bg-ladder-hint/20 px-4 py-2 text-sm font-medium text-ladder-hint transition hover:bg-ladder-hint/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {hintLoading
                  ? "İpucu alınıyor..."
                  : hintCount > 0
                    ? `İpucu (${hintCount} kullanıldı)`
                    : "İpucu"}
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

              <button
                type="button"
                onClick={() => {
                  setShowOptimal((value) => {
                    const next = !value;
                    if (next && !optimalPath && puzzle) {
                      void fetchOptimal(puzzle.date, path);
                    }
                    return next;
                  });
                }}
                disabled={optimalLoading}
                className="w-full rounded-lg border border-ladder-border px-4 py-2.5 text-sm font-medium text-ladder-text transition hover:border-ladder-text disabled:opacity-60"
              >
                {showOptimal
                  ? "En hızlı çözümü gizle"
                  : optimalLoading
                    ? "Yükleniyor…"
                    : "En hızlı çözümü gör"}
              </button>

              {showOptimal && optimalPath && optimalPath.length > 1 && (
                <div className="flex flex-col gap-2 rounded-xl border border-ladder-border bg-ladder-bg/60 p-3">
                  <p className="text-center text-xs font-medium text-ladder-muted">
                    En kısa çözüm · {Math.max(optimalPath.length - 1, 0)} adım
                  </p>
                  {optimalPath.map((word, index) => {
                    const previousWord =
                      index > 0 ? optimalPath[index - 1] : word;
                    const changedIndex =
                      index > 0
                        ? findChangedLetterIndex(previousWord, word)
                        : null;

                    return (
                      <div key={`optimal-${word}-${index}`} className="contents">
                        {index > 0 && <StepArrow />}
                        <WordRow
                          word={word}
                          label={
                            index === 0
                              ? "Başlangıç"
                              : index === optimalPath.length - 1
                                ? `#${index} · Hedef`
                                : `#${index}`
                          }
                          highlight={
                            index === 0
                              ? "start"
                              : index === optimalPath.length - 1
                                ? "end"
                                : "step"
                          }
                          changedIndex={changedIndex}
                          animateIn={false}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {showOptimal && !optimalPath && optimalLoading && (
                <p className="text-center text-xs text-ladder-muted">
                  En hızlı çözüm yükleniyor…
                </p>
              )}

              {showOptimal && !optimalPath && !optimalLoading && optimalError && (
                <p className="text-center text-xs text-red-600 dark:text-red-300">
                  {optimalError}
                </p>
              )}

              <ShareScore
                puzzleNumber={puzzle.puzzleNumber}
                path={path}
                steps={stepCount}
                hints={hintCount}
                puzzleDate={puzzle.date}
                streak={currentStreak}
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

        <HowToPlay />
      </section>
    </div>
  );
}
