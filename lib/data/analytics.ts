import "server-only";
import { db } from "../db";

export const RANGES = { "7d": 7, "30d": 30, "90d": 90 } as const;
export type RangeKey = keyof typeof RANGES;

export const parseRange = (v: string | string[] | undefined): RangeKey =>
  typeof v === "string" && v in RANGES ? (v as RangeKey) : "30d";

export function recordEvent(e: { type: "view" | "click"; path: string; label: string; visitor: string; referrer: string }) {
  db()
    .prepare("INSERT INTO events (type, path, label, visitor, referrer) VALUES (?, ?, ?, ?, ?)")
    .run(e.type, e.path, e.label, e.visitor, e.referrer);
}

/** SQLite time bound `days` ago (negative = in the future). Values are internal integers, never user input. */
const since = (days: number) =>
  days >= 0 ? `datetime('now', '-${Math.trunc(days)} days')` : `datetime('now', '+${Math.trunc(-days)} days')`;

type Totals = { views: number; visitors: number; clicks: number; enquiries: number };

function totalsBetween(fromDays: number, toDays: number): Totals {
  return db()
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM events WHERE type = 'view' AND created_at >= ${since(fromDays)} AND created_at < ${since(toDays)}) AS views,
        (SELECT COUNT(DISTINCT visitor) FROM events WHERE type = 'view' AND created_at >= ${since(fromDays)} AND created_at < ${since(toDays)}) AS visitors,
        (SELECT COUNT(*) FROM events WHERE type = 'click' AND created_at >= ${since(fromDays)} AND created_at < ${since(toDays)}) AS clicks,
        (SELECT COUNT(*) FROM enquiries WHERE created_at >= ${since(fromDays)} AND created_at < ${since(toDays)}) AS enquiries`,
    )
    .get() as Totals;
}

/** Totals for the range plus the preceding period of equal length, for deltas. */
export function overview(range: RangeKey) {
  const days = RANGES[range];
  // Upper bound one day ahead so events recorded moments ago are included.
  const current = totalsBetween(days, -1);
  const previous = totalsBetween(days * 2, days);
  return { current, previous };
}

export function dailySeries(range: RangeKey) {
  const days = RANGES[range];
  const rows = db()
    .prepare(
      `SELECT date(created_at) AS day,
        SUM(type = 'view') AS views,
        COUNT(DISTINCT CASE WHEN type = 'view' THEN visitor END) AS visitors,
        SUM(type = 'click') AS clicks
       FROM events WHERE created_at >= date('now', '-${days - 1} days') GROUP BY day ORDER BY day`,
    )
    .all() as { day: string; views: number; visitors: number; clicks: number }[];
  const enq = db()
    .prepare(`SELECT date(created_at) AS day, COUNT(*) AS n FROM enquiries WHERE created_at >= date('now', '-${days - 1} days') GROUP BY day`)
    .all() as { day: string; n: number }[];

  // Fill gaps so every day in the range has a point.
  const out: { day: string; views: number; visitors: number; clicks: number; enquiries: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i)).toISOString().slice(0, 10);
    const r = rows.find((x) => x.day === d);
    out.push({
      day: d,
      views: r?.views ?? 0,
      visitors: r?.visitors ?? 0,
      clicks: r?.clicks ?? 0,
      enquiries: enq.find((x) => x.day === d)?.n ?? 0,
    });
  }
  return out;
}

export function topPages(range: RangeKey, limit = 8) {
  return db()
    .prepare(
      `SELECT path AS label, COUNT(*) AS n, COUNT(DISTINCT visitor) AS unique_n FROM events
       WHERE type = 'view' AND created_at >= ${since(RANGES[range])} GROUP BY path ORDER BY n DESC LIMIT ?`,
    )
    .all(limit) as { label: string; n: number; unique_n: number }[];
}

export function topClicks(range: RangeKey, limit = 8) {
  return db()
    .prepare(
      `SELECT label, COUNT(*) AS n, COUNT(DISTINCT path) AS pages FROM events
       WHERE type = 'click' AND label != '' AND created_at >= ${since(RANGES[range])} GROUP BY label ORDER BY n DESC LIMIT ?`,
    )
    .all(limit) as { label: string; n: number; pages: number }[];
}

/** Where visitors came from: hostname of the first referrer per visitor, or "Direct". */
export function topReferrers(range: RangeKey, limit = 6) {
  const rows = db()
    .prepare(
      `SELECT visitor, MAX(referrer) AS referrer FROM events
       WHERE type = 'view' AND created_at >= ${since(RANGES[range])} GROUP BY visitor`,
    )
    .all() as { visitor: string; referrer: string }[];
  const counts = new Map<string, number>();
  for (const r of rows) {
    let host = "Direct";
    if (r.referrer) {
      try {
        host = new URL(r.referrer).hostname.replace(/^www\./, "");
      } catch {
        host = "Other";
      }
    }
    counts.set(host, (counts.get(host) ?? 0) + 1);
  }
  return [...counts].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n).slice(0, limit);
}

export function recentActivity(limit = 8) {
  return db()
    .prepare("SELECT type, path, label, created_at FROM events ORDER BY id DESC LIMIT ?")
    .all(limit) as { type: string; path: string; label: string; created_at: string }[];
}
