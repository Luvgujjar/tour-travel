import "server-only";
import { db } from "../db";
import type { Difficulty, ItineraryDay, PackageStatus, TourPackage } from "../types";

type Row = Record<string, string | number | null>;

const json = <T>(v: unknown, fallback: T): T => {
  try {
    return JSON.parse(String(v)) as T;
  } catch {
    return fallback;
  }
};

function toPackage(r: Row): TourPackage {
  return {
    id: Number(r.id),
    slug: String(r.slug),
    title: String(r.title),
    tagline: String(r.tagline),
    days: Number(r.days),
    nights: Number(r.nights),
    route: json<string[]>(r.route, []),
    price: Number(r.price),
    image: String(r.image),
    gallery: json<string[]>(r.gallery, []),
    summary: String(r.summary),
    description: String(r.description),
    highlights: json<string[]>(r.highlights, []),
    inclusions: json<string[]>(r.inclusions, []),
    exclusions: json<string[]>(r.exclusions, []),
    itinerary: json<ItineraryDay[]>(r.itinerary, []),
    difficulty: String(r.difficulty) as Difficulty,
    season: String(r.season),
    groupSize: String(r.group_size),
    status: String(r.status) as PackageStatus,
    featured: Boolean(r.featured),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

const ORDER = "ORDER BY featured DESC, sort ASC, id ASC";

export function listPackages({ includeDrafts = false } = {}) {
  const where = includeDrafts ? "" : "WHERE status = 'published'";
  return (db().prepare(`SELECT * FROM packages ${where} ${ORDER}`).all() as Row[]).map(toPackage);
}

export function featuredPackages(limit = 3) {
  return (
    db().prepare(`SELECT * FROM packages WHERE status = 'published' ${ORDER} LIMIT ?`).all(limit) as Row[]
  ).map(toPackage);
}

export function getPackageBySlug(slug: string, { includeDrafts = false } = {}) {
  const r = db().prepare("SELECT * FROM packages WHERE slug = ?").get(slug) as Row | undefined;
  if (!r) return null;
  const p = toPackage(r);
  return p.status === "published" || includeDrafts ? p : null;
}

export function getPackageById(id: number) {
  const r = db().prepare("SELECT * FROM packages WHERE id = ?").get(id) as Row | undefined;
  return r ? toPackage(r) : null;
}

export function relatedPackages(pkg: TourPackage, limit = 3) {
  return listPackages()
    .filter((p) => p.id !== pkg.id)
    .map((p) => ({ p, score: p.route.filter((r) => pkg.route.includes(r)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export type PackageInput = Omit<TourPackage, "id" | "createdAt" | "updatedAt">;

const COLS = [
  "slug", "title", "tagline", "days", "nights", "route", "price", "image", "gallery", "summary", "description",
  "highlights", "inclusions", "exclusions", "itinerary", "difficulty", "season", "group_size", "status", "featured",
] as const;

const values = (p: PackageInput) => [
  p.slug, p.title, p.tagline, p.days, p.nights, JSON.stringify(p.route), p.price, p.image, JSON.stringify(p.gallery),
  p.summary, p.description, JSON.stringify(p.highlights), JSON.stringify(p.inclusions), JSON.stringify(p.exclusions),
  JSON.stringify(p.itinerary), p.difficulty, p.season, p.groupSize, p.status, p.featured ? 1 : 0,
];

export function slugExists(slug: string, exceptId?: number) {
  return Boolean(db().prepare("SELECT 1 FROM packages WHERE slug = ? AND id != ?").get(slug, exceptId ?? -1));
}

export function createPackage(p: PackageInput) {
  const sort = (db().prepare("SELECT COALESCE(MAX(sort), 0) + 1 AS s FROM packages").get() as { s: number }).s;
  const res = db()
    .prepare(`INSERT INTO packages (${COLS.join(", ")}, sort) VALUES (${COLS.map(() => "?").join(", ")}, ?)`)
    .run(...values(p), sort);
  return Number(res.lastInsertRowid);
}

export function updatePackage(id: number, p: PackageInput) {
  db()
    .prepare(`UPDATE packages SET ${COLS.map((c) => `${c} = ?`).join(", ")}, updated_at = datetime('now') WHERE id = ?`)
    .run(...values(p), id);
}

export function deletePackage(id: number) {
  db().prepare("DELETE FROM packages WHERE id = ?").run(id);
}

export function setPackageFlag(id: number, field: "status" | "featured", value: string | number) {
  const col = field === "status" ? "status" : "featured";
  db().prepare(`UPDATE packages SET ${col} = ?, updated_at = datetime('now') WHERE id = ?`).run(value, id);
}

export function packageStats() {
  return db()
    .prepare(
      `SELECT p.id, p.slug,
        (SELECT COUNT(*) FROM events e WHERE e.type = 'view' AND e.path = '/packages/' || p.slug) AS views,
        (SELECT COUNT(*) FROM enquiries q WHERE q.package_slug = p.slug) AS enquiries,
        (SELECT COUNT(*) FROM enquiries q WHERE q.package_slug = p.slug AND q.status = 'booked') AS booked
       FROM packages p`,
    )
    .all() as { id: number; slug: string; views: number; enquiries: number; booked: number }[];
}
