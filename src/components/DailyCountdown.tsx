"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatCountdown,
  getIstanbulDateKey,
  getSecondsUntilIstanbulMidnight,
} from "@/lib/daily-clock";

interface DailyCountdownProps {
  puzzleDate: string;
  onDayChange: () => void;
}

export function DailyCountdown({
  puzzleDate,
  onDayChange,
}: DailyCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    getSecondsUntilIstanbulMidnight(),
  );
  const hasResetRef = useRef(false);

  useEffect(() => {
    hasResetRef.current = false;
  }, [puzzleDate]);

  useEffect(() => {
    const tick = () => {
      const remaining = getSecondsUntilIstanbulMidnight();
      setSecondsLeft(remaining);

      if (
        getIstanbulDateKey() !== puzzleDate &&
        !hasResetRef.current
      ) {
        hasResetRef.current = true;
        onDayChange();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [onDayChange, puzzleDate]);

  return (
    <div className="rounded-full border border-ladder-border bg-ladder-bg/60 px-3 py-1 text-xs sm:px-4 sm:text-sm">
      <span className="text-ladder-muted">Yeni merdivene </span>
      <span className="font-mono font-medium tabular-nums text-ladder-text">
        {formatCountdown(secondsLeft)}
      </span>
    </div>
  );
}
