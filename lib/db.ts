import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seed } from "./seed";

/**
 * Local SQLite database (Node's built-in `node:sqlite`, no native deps).
 * The file lives in /data and is created + seeded on first access.
 * Note: serverless hosts have ephemeral disks — deploy to a Node server with a
 * persistent volume, or swap this module for a hosted database.
 */
const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "himalayan-escape.db");

const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  days INTEGER NOT NULL,
  nights INTEGER NOT NULL,
  route TEXT NOT NULL DEFAULT '[]',
  price INTEGER NOT NULL,
  image TEXT NOT NULL,
  gallery TEXT NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  highlights TEXT NOT NULL DEFAULT '[]',
  inclusions TEXT NOT NULL DEFAULT '[]',
  exclusions TEXT NOT NULL DEFAULT '[]',
  itinerary TEXT NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL DEFAULT 'Easy',
  season TEXT NOT NULL DEFAULT '',
  group_size TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  featured INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  package_slug TEXT NOT NULL DEFAULT '',
  travel_month TEXT NOT NULL DEFAULT '',
  travellers INTEGER NOT NULL DEFAULT 1,
  message TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL DEFAULT '',
  value INTEGER NOT NULL DEFAULT 0,
  is_demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  visitor TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  is_demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS events_type_time ON events (type, created_at);
CREATE INDEX IF NOT EXISTS events_path ON events (path);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  trip TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

const globalForDb = globalThis as unknown as { __db?: DatabaseSync };

function open() {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  // Seed once. BEGIN IMMEDIATE serialises parallel build workers opening the same file.
  db.exec("BEGIN IMMEDIATE");
  try {
    const seeded = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get();
    if (!seeded) {
      seed(db);
      db.prepare("INSERT INTO meta (key, value) VALUES ('seeded', datetime('now'))").run();
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  return db;
}

export function db() {
  globalForDb.__db ??= open();
  return globalForDb.__db;
}

/** Runs `fn` inside a transaction. */
export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec("BEGIN");
  try {
    const out = fn();
    d.exec("COMMIT");
    return out;
  } catch (err) {
    d.exec("ROLLBACK");
    throw err;
  }
}
