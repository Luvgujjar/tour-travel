"use server";

import { createEnquiry } from "../data/crm";
import { getPackageBySlug } from "../data/packages";

export type EnquiryState = { ok: boolean; message: string; errors?: Record<string, string> };

const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);

export async function submitEnquiry(_prev: EnquiryState | null, form: FormData): Promise<EnquiryState> {
  // Honeypot: real users never fill this hidden field.
  if (str(form, "company")) return { ok: true, message: "Thanks! We'll be in touch shortly." };

  const name = str(form, "name", 120);
  const email = str(form, "email", 160);
  const phone = str(form, "phone", 30);
  const packageSlug = str(form, "package", 120);
  const travelMonth = str(form, "month", 7);
  const travellers = Math.min(50, Math.max(1, Number(form.get("guests")) || 1));
  const message = str(form, "notes", 2000);
  const source = ["plan-dialog", "contact", "package-page"].includes(str(form, "source")) ? str(form, "source") : "website";

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!email && !phone) errors.phone = "Add a phone number or email so we can reach you.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "That email doesn't look right.";
  if (phone && !/^[+\d][\d\s-]{6,}$/.test(phone)) errors.phone = "That phone number doesn't look right.";
  if (travelMonth && !/^\d{4}-\d{2}$/.test(travelMonth)) errors.month = "Pick a month.";
  if (Object.keys(errors).length) return { ok: false, message: "Please check the highlighted fields.", errors };

  const validSlug = packageSlug && getPackageBySlug(packageSlug) ? packageSlug : packageSlug === "custom" ? "custom" : "";
  createEnquiry({ name, email, phone, packageSlug: validSlug, travelMonth, travellers, message, source });
  return { ok: true, message: `Thanks ${name.split(" ")[0]}! A trip planner will contact you within a few hours.` };
}
