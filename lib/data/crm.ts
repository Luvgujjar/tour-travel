import "server-only";
import { db } from "../db";
import { ENQUIRY_STATUSES, type Enquiry, type EnquiryStatus, type Settings, type Testimonial } from "../types";

type Row = Record<string, string | number | null>;

/* ---------------- Enquiries (CRM) ---------------- */

function toEnquiry(r: Row): Enquiry {
  return {
    id: Number(r.id),
    name: String(r.name),
    email: String(r.email),
    phone: String(r.phone),
    packageSlug: String(r.package_slug),
    travelMonth: String(r.travel_month),
    travellers: Number(r.travellers),
    message: String(r.message),
    source: String(r.source),
    status: String(r.status) as EnquiryStatus,
    notes: String(r.notes),
    value: Number(r.value),
    isDemo: Boolean(r.is_demo),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

export type EnquiryInput = Pick<
  Enquiry,
  "name" | "email" | "phone" | "packageSlug" | "travelMonth" | "travellers" | "message" | "source"
>;

export function createEnquiry(e: EnquiryInput) {
  const res = db()
    .prepare(
      "INSERT INTO enquiries (name, email, phone, package_slug, travel_month, travellers, message, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(e.name, e.email, e.phone, e.packageSlug, e.travelMonth, e.travellers, e.message, e.source);
  return Number(res.lastInsertRowid);
}

export function listEnquiries({ status, q }: { status?: string; q?: string } = {}) {
  const where: string[] = [];
  const args: string[] = [];
  if (status && (ENQUIRY_STATUSES as readonly string[]).includes(status)) {
    where.push("status = ?");
    args.push(status);
  }
  if (q) {
    where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR package_slug LIKE ? OR message LIKE ?)");
    const like = `%${q}%`;
    args.push(like, like, like, like, like);
  }
  const sql = `SELECT * FROM enquiries ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC`;
  return (db().prepare(sql).all(...args) as Row[]).map(toEnquiry);
}

export function getEnquiry(id: number) {
  const r = db().prepare("SELECT * FROM enquiries WHERE id = ?").get(id) as Row | undefined;
  return r ? toEnquiry(r) : null;
}

export function updateEnquiry(id: number, patch: { status: EnquiryStatus; notes: string; value: number }) {
  db()
    .prepare("UPDATE enquiries SET status = ?, notes = ?, value = ?, updated_at = datetime('now') WHERE id = ?")
    .run(patch.status, patch.notes, patch.value, id);
}

export function deleteEnquiry(id: number) {
  db().prepare("DELETE FROM enquiries WHERE id = ?").run(id);
}

export function enquiryPipeline() {
  const rows = db().prepare("SELECT status, COUNT(*) AS n, COALESCE(SUM(value), 0) AS value FROM enquiries GROUP BY status").all() as {
    status: EnquiryStatus;
    n: number;
    value: number;
  }[];
  return ENQUIRY_STATUSES.map((s) => rows.find((r) => r.status === s) ?? { status: s, n: 0, value: 0 });
}

/* ---------------- Testimonials ---------------- */

const toTestimonial = (r: Row): Testimonial => ({
  id: Number(r.id),
  name: String(r.name),
  location: String(r.location),
  trip: String(r.trip),
  quote: String(r.quote),
  visible: Boolean(r.visible),
  createdAt: String(r.created_at),
});

export function listTestimonials({ onlyVisible = true } = {}) {
  const where = onlyVisible ? "WHERE visible = 1" : "";
  return (db().prepare(`SELECT * FROM testimonials ${where} ORDER BY id DESC`).all() as Row[]).map(toTestimonial);
}

export function createTestimonial(t: Omit<Testimonial, "id" | "createdAt" | "visible">) {
  db().prepare("INSERT INTO testimonials (name, location, trip, quote) VALUES (?, ?, ?, ?)").run(t.name, t.location, t.trip, t.quote);
}

export function toggleTestimonial(id: number) {
  db().prepare("UPDATE testimonials SET visible = 1 - visible WHERE id = ?").run(id);
}

export function deleteTestimonial(id: number) {
  db().prepare("DELETE FROM testimonials WHERE id = ?").run(id);
}

/* ---------------- Settings ---------------- */

export function getSettings(): Settings {
  const rows = db().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    phone: map.phone ?? "",
    email: map.email ?? "",
    whatsapp: map.whatsapp ?? "",
    instagram: map.instagram ?? "",
    address: map.address ?? "",
    announcement: map.announcement ?? "",
  };
}

export function saveSettings(s: Settings) {
  const stmt = db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  for (const [k, v] of Object.entries(s)) stmt.run(k, v);
}

export function clearDemoData() {
  db().exec("DELETE FROM events WHERE is_demo = 1; DELETE FROM enquiries WHERE is_demo = 1;");
}

export function clearAnalytics() {
  db().exec("DELETE FROM events;");
}

export function demoDataCounts() {
  return db()
    .prepare("SELECT (SELECT COUNT(*) FROM events WHERE is_demo = 1) AS events, (SELECT COUNT(*) FROM enquiries WHERE is_demo = 1) AS enquiries")
    .get() as { events: number; enquiries: number };
}
