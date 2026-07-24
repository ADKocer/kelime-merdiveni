export const ISTANBUL_TIMEZONE = "Europe/Istanbul";
export const GAME_LAUNCH_DATE = "2026-01-01";

export function getIstanbulDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ISTANBUL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getSecondsUntilIstanbulMidnight(now = new Date()): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ISTANBUL_TIMEZONE,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  let hour = value("hour");
  if (hour === 24) hour = 0;

  const elapsed = hour * 3600 + value("minute") * 60 + value("second");
  return 86400 - elapsed;
}

export function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}
