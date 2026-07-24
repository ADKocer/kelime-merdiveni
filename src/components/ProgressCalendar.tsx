"use client";

import { useEffect, useMemo, useState } from "react";
import { GAME_LAUNCH_DATE } from "@/lib/daily-clock";
import { type DayRecord } from "@/lib/player-history";

interface ProgressCalendarProps {
  refreshKey: number;
  todayKey: string;
  records: Record<string, DayRecord>;
  onSelectDate?: (dateKey: string) => void;
}

type DayStatus =
  | "empty"
  | "future"
  | "today"
  | "completed"
  | "late"
  | "missed";

const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const WEEKDAY_NAMES = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDayStatus(
  dateKey: string,
  todayKey: string,
  records: Record<string, DayRecord>,
): DayStatus {
  if (dateKey < GAME_LAUNCH_DATE) return "empty";
  if (dateKey > todayKey) return "future";

  const record = records[dateKey];
  if (record?.status === "late") return "late";
  if (record?.status === "onTime") return "completed";

  if (dateKey === todayKey) return "today";
  return "missed";
}

function buildMonthGrid(year: number, month: number): Array<string | null> {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startOffset = (firstDay.getUTCDay() + 6) % 7;
  const cells: Array<string | null> = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toDateKey(year, month, day));
  }

  return cells;
}

function parseTodayKey(todayKey: string): { year: number; month: number } {
  const [year, month] = todayKey.split("-").map(Number);
  return { year, month };
}

const LAUNCH_YEAR = Number(GAME_LAUNCH_DATE.slice(0, 4));
const LAUNCH_MONTH = Number(GAME_LAUNCH_DATE.slice(5, 7));

const STATUS_STYLES: Record<DayStatus, string> = {
  empty: "invisible",
  future: "border-ladder-border/40 bg-ladder-bg/20 text-ladder-muted/40",
  today:
    "border-blue-500 bg-blue-500/15 text-ladder-text ring-2 ring-blue-500/40",
  completed:
    "border-emerald-600 bg-emerald-500/35 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-500/30 dark:text-emerald-50",
  late: "border-orange-600 bg-orange-500/35 text-orange-950 dark:border-orange-500 dark:bg-orange-500/30 dark:text-orange-50",
  missed:
    "border-red-500 bg-red-500/25 text-red-800 dark:border-red-500/40 dark:bg-red-500/20 dark:text-red-100",
};

export function ProgressCalendar({
  refreshKey,
  todayKey,
  records,
  onSelectDate,
}: ProgressCalendarProps) {
  const today = parseTodayKey(todayKey);
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);

  useEffect(() => {
    setViewYear(today.year);
    setViewMonth(today.month);
  }, [today.month, today.year]);

  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const canGoPrev =
    viewYear > LAUNCH_YEAR ||
    (viewYear === LAUNCH_YEAR && viewMonth > LAUNCH_MONTH);

  const canGoNext =
    viewYear < today.year ||
    (viewYear === today.year && viewMonth < today.month);

  const goPrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((year) => year - 1);
      setViewMonth(12);
      return;
    }
    setViewMonth((month) => month - 1);
  };

  const goNextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 12) {
      setViewYear((year) => year + 1);
      setViewMonth(1);
      return;
    }
    setViewMonth((month) => month + 1);
  };

  return (
    <div className="min-w-0 overflow-x-hidden rounded-xl border border-ladder-border/70 bg-ladder-bg/40 p-3 sm:p-4">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <div>
          <p className="font-medium text-ladder-text">İlerleme Takvimi</p>
          <p className="text-xs text-ladder-muted">
            Yeşil: gününde · Turuncu: geç tamamlandı · Kırmızı: kaçırıldı
          </p>
          {onSelectDate && (
            <p className="mt-1 text-xs text-ladder-muted">
              Geçmiş bir güne dokunarak o merdiveni oynayabilirsin.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            onClick={goPrevMonth}
            disabled={!canGoPrev}
            className="rounded-lg border border-ladder-border px-2 py-1 text-sm text-ladder-muted transition hover:text-ladder-text disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Önceki ay"
          >
            ‹
          </button>
          <span className="min-w-[7rem] text-center text-sm font-medium">
            {MONTH_NAMES[viewMonth - 1]} {viewYear}
          </span>
          <button
            type="button"
            onClick={goNextMonth}
            disabled={!canGoNext}
            className="rounded-lg border border-ladder-border px-2 py-1 text-sm text-ladder-muted transition hover:text-ladder-text disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Sonraki ay"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-ladder-muted"
          >
            {name}
          </div>
        ))}
      </div>

      <div key={refreshKey} className="grid grid-cols-7 gap-1">
        {cells.map((dateKey, index) => {
          if (!dateKey) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const status = getDayStatus(dateKey, todayKey, records);
          const dayNumber = Number(dateKey.split("-")[2]);
          const isPlayable =
            status !== "empty" &&
            status !== "future" &&
            Boolean(onSelectDate);

          const className = `flex aspect-square items-center justify-center rounded-md border text-xs font-semibold sm:rounded-lg sm:text-sm ${STATUS_STYLES[status]} ${
            isPlayable
              ? "cursor-pointer transition hover:brightness-110 active:scale-95"
              : ""
          }`;

          if (isPlayable) {
            return (
              <button
                key={dateKey}
                type="button"
                title={dateKey}
                onClick={() => onSelectDate?.(dateKey)}
                className={className}
              >
                {dayNumber}
              </button>
            );
          }

          return (
            <div key={dateKey} title={dateKey} className={className}>
              {status === "empty" ? "" : dayNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
}
