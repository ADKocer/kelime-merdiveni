import { nameKey } from "./player-identity";
import { isBetterScore } from "./score-display";
import { ensureLeaderboardSchema, getTurso } from "./turso";

export interface LeaderboardEntry {
  id: number;
  playerId?: string;
  playerName: string;
  puzzleDate: string;
  steps: number;
  hints: number;
  path: string;
  completedAt: string;
}

export type ClaimNameResult =
  | { ok: true; claimedName: string }
  | { ok: false; error: string };

async function withDb<T>(fn: () => Promise<T>): Promise<T> {
  await ensureLeaderboardSchema();
  return fn();
}

function mapRow(row: Record<string, unknown>): LeaderboardEntry {
  return {
    id: Number(row.id),
    playerId: row.player_id != null ? String(row.player_id) : undefined,
    playerName: String(row.player_name),
    puzzleDate: String(row.puzzle_date),
    steps: Number(row.steps),
    hints: Number(row.hints ?? 0),
    path: String(row.path),
    completedAt: String(row.completed_at),
  };
}

export async function getClaimedNameForPlayer(
  playerId: string,
): Promise<string | null> {
  return withDb(async () => {
    const db = getTurso();
    const result = await db.execute({
      sql: `SELECT display_name FROM name_claims WHERE player_id = ? LIMIT 1`,
      args: [playerId],
    });
    const row = result.rows[0];
    return row ? String(row.display_name) : null;
  });
}

export async function assertCanUseName(
  playerId: string,
  playerName: string,
): Promise<ClaimNameResult> {
  return withDb(async () => {
    const db = getTurso();
    const key = nameKey(playerName);
    const trimmed = playerName.trim();

    const owned = await db.execute({
      sql: `SELECT name_key, display_name FROM name_claims WHERE player_id = ? LIMIT 1`,
      args: [playerId],
    });
    const ownedRow = owned.rows[0];
    if (ownedRow && String(ownedRow.name_key) !== key) {
      return {
        ok: false,
        error: `Sen zaten "${String(ownedRow.display_name)}" ismiyle kayıtlısın.`,
      };
    }

    const claimed = await db.execute({
      sql: `SELECT player_id FROM name_claims WHERE name_key = ? LIMIT 1`,
      args: [key],
    });
    const claimedRow = claimed.rows[0];
    if (claimedRow && String(claimedRow.player_id) !== playerId) {
      return { ok: false, error: "Bu isim daha önce alınmış." };
    }

    return { ok: true, claimedName: trimmed };
  });
}

export async function saveScore(input: {
  playerId: string;
  playerName: string;
  puzzleDate: string;
  steps: number;
  hints: number;
  path: string[];
}): Promise<LeaderboardEntry> {
  return withDb(async () => {
    const claim = await assertCanUseName(input.playerId, input.playerName);
    if (!claim.ok) {
      throw new Error(claim.error);
    }

    const db = getTurso();
    const playerName = input.playerName.trim();
    const key = nameKey(playerName);
    const completedAt = new Date().toISOString();
    const pathJson = JSON.stringify(input.path);
    const hints = Math.max(0, input.hints);

    await db.batch(
      [
        {
          sql: `INSERT INTO name_claims (name_key, player_id, display_name, created_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(name_key) DO UPDATE SET
                  display_name = excluded.display_name
                WHERE name_claims.player_id = excluded.player_id`,
          args: [key, input.playerId, playerName, completedAt],
        },
        {
          sql: `DELETE FROM scores WHERE puzzle_date = ? AND player_id = ?`,
          args: [input.puzzleDate, input.playerId],
        },
        {
          sql: `INSERT INTO scores (player_id, player_name, puzzle_date, steps, hints, path, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            input.playerId,
            playerName,
            input.puzzleDate,
            input.steps,
            hints,
            pathJson,
            completedAt,
          ],
        },
      ],
      "write",
    );

    const inserted = await db.execute({
      sql: `SELECT id, player_id, player_name, puzzle_date, steps, hints, path, completed_at
            FROM scores
            WHERE player_id = ? AND puzzle_date = ?
            ORDER BY id DESC LIMIT 1`,
      args: [input.playerId, input.puzzleDate],
    });

    const row = inserted.rows[0];
    if (!row) {
      throw new Error("Skor kaydı doğrulanamadı.");
    }

    return mapRow(row as Record<string, unknown>);
  });
}

const SCORE_ORDER_SQL = `(steps + hints) ASC, hints ASC, completed_at ASC`;

export async function getLeaderboard(
  puzzleDate: string,
  limit = 10,
): Promise<LeaderboardEntry[]> {
  return withDb(async () => {
    const db = getTurso();
    const result = await db.execute({
      sql: `
        SELECT id, player_id, player_name, puzzle_date, steps, hints, path, completed_at
        FROM (
          SELECT
            id, player_id, player_name, puzzle_date, steps, hints, path, completed_at,
            ROW_NUMBER() OVER (
              PARTITION BY player_id
              ORDER BY ${SCORE_ORDER_SQL}
            ) AS rn
          FROM scores
          WHERE puzzle_date = ?
        ) AS ranked
        WHERE rn = 1
        ORDER BY ${SCORE_ORDER_SQL}
        LIMIT ?
      `,
      args: [puzzleDate, limit],
    });

    return result.rows.map((row) =>
      mapRow(row as Record<string, unknown>),
    );
  });
}

export async function getBestScoreForPlayer(
  playerId: string,
  puzzleDate: string,
): Promise<LeaderboardEntry | null> {
  return withDb(async () => {
    const db = getTurso();
    const result = await db.execute({
      sql: `SELECT id, player_id, player_name, puzzle_date, steps, hints, path, completed_at
            FROM scores
            WHERE player_id = ? AND puzzle_date = ?
            ORDER BY ${SCORE_ORDER_SQL}
            LIMIT 1`,
      args: [playerId, puzzleDate],
    });

    const row = result.rows[0];
    if (!row) return null;

    return mapRow(row as Record<string, unknown>);
  });
}

export function scoreIsImprovement(
  existing: LeaderboardEntry,
  steps: number,
  hints: number,
): boolean {
  return isBetterScore(steps, hints, existing.steps, existing.hints);
}
