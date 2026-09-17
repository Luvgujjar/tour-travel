"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminCredentials, requireAdmin } from "../auth";
import {
  clearAnalytics,
  clearDemoData,
  createEnquiry,
  createTestimonial,
  deleteEnquiry,
  deleteTestimonial,
  getEnquiry,
  saveSettings,
  toggleTestimonial,
  updateEnquiry,
} from "../data/crm";
import {
  createPackage,
  deletePackage,
  getPackageById,
  setPackageFlag,
  slugExists,
  updatePackage,
  type PackageInput,
} from "../data/packages";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createToken, safeEqual } from "../session";
import { ENQUIRY_STATUSES, type Difficulty, type EnquiryStatus, type ItineraryDay } from "../types";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const lines = (f: FormData, k: string) =>
  str(f, k, 10000)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const id = (f: FormData) => {
  const n = Number(f.get("id"));
  if (!Number.isInteger(n) || n <= 0) throw new Error("Invalid id");
  return n;
};

/** Public pages are statically rendered from the DB — refresh them after content changes. */
const refreshSite = () => revalidatePath("/", "layout");

/* ---------------- Auth ---------------- */

const attempts = new Map<string, { n: number; until: number }>();

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const a = attempts.get(ip);
  if (a && a.until > Date.now() && a.n >= 5) {
    return { ok: false, message: "Too many attempts. Try again in a few minutes." };
  }

  const creds = adminCredentials();
  const username = str(form, "username", 100);
  const password = str(form, "password", 200);
  const valid = Boolean(creds.password) && safeEqual(username, creds.username) && safeEqual(password, creds.password);

  if (!valid) {
    attempts.set(ip, { n: (a && a.until > Date.now() ? a.n : 0) + 1, until: Date.now() + 5 * 60_000 });
    return {
      ok: false,
      message: creds.password ? "Incorrect username or password." : "Admin login is disabled: set ADMIN_PASSWORD.",
    };
  }
  attempts.delete(ip);

  (await cookies()).set(SESSION_COOKIE, createToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  const next = str(form, "next", 200);
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------------- Packages ---------------- */

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 80);

const isUrl = (s: string) => /^https:\/\/images\.unsplash\.com\/photo-[\w-]+$/.test(s);

function parsePackage(form: FormData): { data?: PackageInput; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = str(form, "title", 120);
  const slug = slugify(str(form, "slug", 80) || title);
  const days = Number(form.get("days"));
  const nights = Number(form.get("nights"));
  const price = Number(String(form.get("price")).replace(/[,\s₹]/g, ""));
  const image = str(form, "image", 300);
  const gallery = lines(form, "gallery");
  const status = str(form, "status") === "published" ? "published" : "draft";
  const difficulty = (["Easy", "Moderate", "Challenging"].includes(str(form, "difficulty")) ? str(form, "difficulty") : "Easy") as Difficulty;

  const titles = form.getAll("dayTitle").map(String);
  const itinerary: ItineraryDay[] = titles
    .map((t, i) => ({
      title: t.trim().slice(0, 120),
      detail: String(form.getAll("dayDetail")[i] ?? "").trim().slice(0, 1000),
      stay: String(form.getAll("dayStay")[i] ?? "").trim().slice(0, 80),
      meals: String(form.getAll("dayMeals")[i] ?? "").trim().slice(0, 80),
      travel: String(form.getAll("dayTravel")[i] ?? "").trim().slice(0, 80),
    }))
    .filter((d) => d.title);

  if (title.length < 3) errors.title = "Title is required.";
  if (!slug) errors.slug = "Slug is required.";
  if (!Number.isInteger(days) || days < 1 || days > 60) errors.days = "1–60 days.";
  if (!Number.isInteger(nights) || nights < 0 || nights > 60) errors.nights = "0–60 nights.";
  if (!Number.isFinite(price) || price < 0) errors.price = "Enter a valid price.";
  if (!isUrl(image)) errors.image = "Use an Unsplash image URL (https://images.unsplash.com/photo-…).";
  if (gallery.some((g) => !isUrl(g))) errors.gallery = "Every gallery line must be an Unsplash image URL.";
  if (status === "published" && itinerary.length === 0) errors.itinerary = "Add at least one itinerary day before publishing.";

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    data: {
      slug,
      title,
      tagline: str(form, "tagline", 160),
      days,
      nights,
      route: str(form, "route", 300)
        .split(/[,•→]/)
        .map((r) => r.trim())
        .filter(Boolean),
      price: Math.round(price),
      image,
      gallery,
      summary: str(form, "summary", 400),
      description: str(form, "description", 4000),
      highlights: lines(form, "highlights"),
      inclusions: lines(form, "inclusions"),
      exclusions: lines(form, "exclusions"),
      itinerary,
      difficulty,
      season: str(form, "season", 80),
      groupSize: str(form, "groupSize", 40),
      status,
      featured: form.get("featured") === "on",
    },
  };
}

export async function savePackage(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const existingId = Number(form.get("id")) || undefined;
  const { data, errors } = parsePackage(form);
  if (data && slugExists(data.slug, existingId)) errors.slug = "Another package already uses this slug.";
  if (!data || Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  let newId = existingId;
  if (existingId) updatePackage(existingId, data);
  else newId = createPackage(data);
  refreshSite();
  redirect(`/admin/packages?saved=${newId}`);
}

export async function removePackage(form: FormData) {
  await requireAdmin();
  deletePackage(id(form));
  refreshSite();
  redirect("/admin/packages?deleted=1");
}

export async function duplicatePackage(form: FormData) {
  await requireAdmin();
  const p = getPackageById(id(form));
  if (!p) return;
  let slug = `${p.slug}-copy`;
  for (let i = 2; slugExists(slug); i++) slug = `${p.slug}-copy-${i}`;
  const copy: PackageInput = { ...p, slug, title: `${p.title} (Copy)`, status: "draft", featured: false };
  const newId = createPackage(copy);
  redirect(`/admin/packages/${newId}`);
}

export async function togglePackageStatus(form: FormData) {
  await requireAdmin();
  const p = getPackageById(id(form));
  if (!p) return;
  if (p.status === "draft" && p.itinerary.length === 0) return;
  setPackageFlag(p.id, "status", p.status === "published" ? "draft" : "published");
  refreshSite();
  revalidatePath("/admin/packages");
}

export async function togglePackageFeatured(form: FormData) {
  await requireAdmin();
  const p = getPackageById(id(form));
  if (!p) return;
  setPackageFlag(p.id, "featured", p.featured ? 0 : 1);
  refreshSite();
  revalidatePath("/admin/packages");
}

/* ---------------- Enquiries ---------------- */

export async function saveEnquiry(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const status = str(form, "status") as EnquiryStatus;
  if (!ENQUIRY_STATUSES.includes(status)) return { ok: false, message: "Invalid status." };
  const value = Math.max(0, Math.round(Number(String(form.get("value")).replace(/[,\s₹]/g, "")) || 0));
  updateEnquiry(id(form), { status, notes: str(form, "notes", 4000), value });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Enquiry updated." };
}

export async function quickStatus(form: FormData) {
  await requireAdmin();
  const status = str(form, "status") as EnquiryStatus;
  if (!ENQUIRY_STATUSES.includes(status)) return;
  const eid = id(form);
  const e = getEnquiry(eid);
  if (!e) return;
  updateEnquiry(eid, { status, notes: e.notes, value: e.value });
  revalidatePath("/admin", "layout");
}

export async function removeEnquiry(form: FormData) {
  await requireAdmin();
  deleteEnquiry(id(form));
  revalidatePath("/admin", "layout");
  redirect("/admin/enquiries?deleted=1");
}

export async function addEnquiry(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(form, "name", 120);
  if (name.length < 2) return { ok: false, message: "Name is required.", errors: { name: "Name is required." } };
  const newId = createEnquiry({
    name,
    email: str(form, "email", 160),
    phone: str(form, "phone", 30),
    packageSlug: str(form, "package", 120),
    travelMonth: str(form, "month", 7),
    travellers: Math.min(50, Math.max(1, Number(form.get("guests")) || 1)),
    message: str(form, "notes", 2000),
    source: str(form, "source", 40) || "manual",
  });
  revalidatePath("/admin", "layout");
  redirect(`/admin/enquiries/${newId}`);
}

/* ---------------- Testimonials ---------------- */

export async function addTestimonial(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(form, "name", 120);
  const quote = str(form, "quote", 600);
  if (name.length < 2 || quote.length < 10) return { ok: false, message: "Name and a quote (10+ characters) are required." };
  createTestimonial({ name, quote, location: str(form, "location", 80), trip: str(form, "trip", 80) });
  refreshSite();
  return { ok: true, message: "Testimonial added." };
}

export async function flipTestimonial(form: FormData) {
  await requireAdmin();
  toggleTestimonial(id(form));
  refreshSite();
}

export async function removeTestimonial(form: FormData) {
  await requireAdmin();
  deleteTestimonial(id(form));
  refreshSite();
}

/* ---------------- Settings ---------------- */

export async function updateSettings(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const whatsapp = str(form, "whatsapp", 20).replace(/\D/g, "");
  const email = str(form, "email", 160);
  const errors: Record<string, string> = {};
  if (whatsapp && whatsapp.length < 10) errors.whatsapp = "Use the full number with country code, digits only.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };
  saveSettings({
    phone: str(form, "phone", 30),
    email,
    whatsapp,
    instagram: str(form, "instagram", 60).replace(/^@/, ""),
    address: str(form, "address", 200),
    announcement: str(form, "announcement", 160),
  });
  refreshSite();
  return { ok: true, message: "Settings saved — the website has been updated." };
}

export async function purgeDemoData() {
  await requireAdmin();
  clearDemoData();
  revalidatePath("/admin", "layout");
}

export async function purgeAnalytics() {
  await requireAdmin();
  clearAnalytics();
  revalidatePath("/admin", "layout");
}
