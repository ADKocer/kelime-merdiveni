import { getIstanbulDateKey } from "./daily-clock";

const COMPLETED_DAYS_KEY = "kelime-merdiveni-completed-days";

export type CompletionStatus = "onTime" | "late";

export interface DayRecord {
  status: CompletionStatus;
  steps: number;
  path?: string[];
  optimalSteps?: number;
}

function readRaw(): unknown {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(COMPLETED_DAYS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function migrateRecords(raw: unknown): Record<string, DayRecord> {
  if (Array.isArray(raw)) {
    const today = getIstanbulDateKey();
    const migrated: Record<string, DayRecord> = {};

    for (const dateKey of raw) {
      if (typeof dateKey !== "string") continue;
      migrated[dateKey] = {
        status: dateKey === today ? "onTime" : "late",
        steps: 0,
      };
    }

    return migrated;
  }

  if (raw && typeof raw === "object") {
    const today = getIstanbulDateKey();
    const migrated: Record<string, DayRecord> = {};

    for (const [dateKey, value] of Object.entries(raw as Record<string, unknown>)) {
      if (value === true) {
        migrated[dateKey] = {
          status: dateKey === today ? "onTime" : "late",
          steps: 0,
        };
        continue;
      }

      if (!value || typeof value !== "object") continue;
      const record = value as Partial<DayRecord>;
      const steps = typeof record.steps === "number" ? record.steps : 0;
      const status: CompletionStatus =
        record.status === "onTime" || record.status === "late"
          ? record.status
          : dateKey === today
            ? "onTime"
            : "late";

      migrated[dateKey] = {
        status,
        steps,
        path: Array.isArray(record.path) ? (record.path as string[]) : undefined,
      };
    }

    return migrated;
  }

  return {};
}

export function saveDayRecords(records: Record<string, DayRecord>): void {
  writeRecords(records);
}

function writeRecords(records: Record<string, DayRecord>): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      COMPLETED_DAYS_KEY,
      JSON.stringify(
        Object.fromEntries(
          Object.entries(records).sort(([a], [b]) => a.localeCompare(b)),
        ),
      ),
    );
  } catch {
    // localStorage kullanılamıyorsa sessizce devam et
  }
}

export function getDayRecords(): Record<string, DayRecord> {
  return migrateRecords(readRaw());
}

export function buildDayRecord(
  puzzleDate: string,
  steps: number,
  path?: string[],
  optimalSteps?: number,
): DayRecord {
  const completedOn = getIstanbulDateKey();
  return {
    status: completedOn === puzzleDate ? "onTime" : "late",
    steps,
    path,
    optimalSteps,
  };
}

export function markDayCompleted(
  puzzleDate: string,
  steps: number,
  path?: string[],
  optimalSteps?: number,
): DayRecord | null {
  if (typeof window === "undefined") return null;

  const record = buildDayRecord(puzzleDate, steps, path, optimalSteps);

  try {
    const records = getDayRecords();
    records[puzzleDate] = record;
    writeRecords(records);
    return record;
  } catch {
    return null;
  }
}
