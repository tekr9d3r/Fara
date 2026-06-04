import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

// GET /api/leaderboard
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const sql = getDb();

    const challenges = await sql`
      SELECT id, tickers, starts_at, ends_at
      FROM challenges
      WHERE active = true AND ends_at > now()
      ORDER BY created_at DESC
      LIMIT 1`;

    const challenge = challenges[0] ?? null;
    const tickers: string[] = challenge?.tickers ?? [];
    const startsAt: string = challenge?.starts_at ?? new Date(0).toISOString();
    const endsAt: string = challenge?.ends_at ?? new Date().toISOString();

    const baseRows = await sql`
      SELECT
        user_id,
        COUNT(*)::int AS total_snaps,
        COUNT(DISTINCT ticker)::int AS unique_stocks,
        MAX(created_at) AS last_snap_at
      FROM holdings
      GROUP BY user_id
      ORDER BY total_snaps DESC
      LIMIT 50`;

    const progressMap = new Map<string, number>();
    if (tickers.length > 0) {
      const progressRows = await sql`
        SELECT user_id, COUNT(DISTINCT ticker)::int AS challenge_progress
        FROM holdings
        WHERE ticker = ANY(${tickers})
          AND created_at >= ${startsAt}
          AND created_at <= ${endsAt}
        GROUP BY user_id`;

      for (const row of progressRows) {
        progressMap.set(row.user_id as string, row.challenge_progress as number);
      }
    }

    const merged = baseRows.map((r) => ({
      user_id: r.user_id as string,
      total_snaps: r.total_snaps as number,
      unique_stocks: r.unique_stocks as number,
      challenge_progress: progressMap.get(r.user_id as string) ?? 0,
      last_snap_at: r.last_snap_at as string,
    }));

    merged.sort((a, b) =>
      b.challenge_progress !== a.challenge_progress
        ? b.challenge_progress - a.challenge_progress
        : b.total_snaps - a.total_snaps
    );

    const leaderboard = merged.map((r, i) => ({
      rank: i + 1,
      user_id: r.user_id,
      total_snaps: r.total_snaps,
      unique_stocks: r.unique_stocks,
      challenge_progress: r.challenge_progress,
      challenge_total: tickers.length,
      completed: r.challenge_progress >= tickers.length && tickers.length > 0,
      last_snap_at: r.last_snap_at,
    }));

    return res.status(200).json({ leaderboard, challenge_tickers: tickers });
  } catch (e) {
    console.error("leaderboard error:", e);
    return res.status(500).json({ error: e instanceof Error ? e.message : "DB error" });
  }
}
