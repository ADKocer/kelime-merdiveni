import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

async function ensureHintsColumn(db: Client): Promise<void> {
  try {
    await db.execute(
      `ALTER TABLE scores ADD COLUMN hints INTEGER NOT NULL DEFAULT 0`,
    );
  } catch {
    // Kolon zaten var
  }
}

/**
 * Yerelde Turso yoksa dosya DB kullanır.
 * Vercel'de TURSO_DATABASE_URL + TURSO_AUTH_TOKEN zorunlu.
 */
export function getTurso(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      throw new Error(
        "TURSO_DATABASE_URL tanımlı değil. Vercel Environment Variables'a ekle.",
      );
    }
    client = createClient({ url: "file:data/local-leaderboard.db" });
    return client;
  }

  client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });
  return client;
}

export async function ensureLeaderboardSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getTurso();
      await db.batch(
        [
          `CREATE TABLE IF NOT EXISTS name_claims (
            name_key TEXT PRIMARY KEY,
            player_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at TEXT NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id TEXT NOT NULL,
            player_name TEXT NOT NULL,
            puzzle_date TEXT NOT NULL,
            steps INTEGER NOT NULL,
            path TEXT NOT NULL,
            completed_at TEXT NOT NULL
          )`,
          `CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(puzzle_date)`,
          `CREATE INDEX IF NOT EXISTS idx_scores_player_date ON scores(player_id, puzzle_date)`,
          `CREATE INDEX IF NOT EXISTS idx_claims_player ON name_claims(player_id)`,
        ],
        "write",
      );
      await ensureHintsColumn(db);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  await schemaReady;
}
