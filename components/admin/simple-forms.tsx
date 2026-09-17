"use client";

import { useRef } from "react";
import { addTestimonial, updateSettings, type FormState } from "@/lib/actions/admin";
import { useActionForm } from "@/lib/use-action-form";
import type { Settings } from "@/lib/types";

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p role="status" className={`text-sm ${state.ok ? "text-ok" : "text-err"}`}>
      {state.message}
    </p>
  );
}

export function TestimonialForm() {
  const ref = useRef<HTMLFormElement>(null);
  const { state, pending, formProps } = useActionForm<FormState>(async (prev, form) => {
    const res = await addTestimonial(prev, form);
    if (res?.ok) ref.current?.reset();
    return res;
  }, null);
  return (
    <form ref={ref} {...formProps} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="t-name" className="label">Traveller name *</label>
          <input id="t-name" name="name" required className="field" />
        </div>
        <div>
          <label htmlFor="t-location" className="label">From</label>
          <input id="t-location" name="location" placeholder="City" className="field" />
        </div>
        <div>
          <label htmlFor="t-trip" className="label">Trip</label>
          <input id="t-trip" name="trip" placeholder="Package name" className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="t-quote" className="label">Review *</label>
        <textarea id="t-quote" name="quote" rows={3} required maxLength={600} className="field" />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm disabled:opacity-60">
          {pending ? "Adding…" : "Add testimonial"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const { state, pending, formProps } = useActionForm<FormState>(updateSettings, null);
  const err = state?.errors ?? {};
  const fields: { name: keyof Settings; label: string; hint?: string; type?: string }[] = [
    { name: "phone", label: "Phone", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "whatsapp", label: "WhatsApp number", hint: "Country code + number, digits only (e.g. 919876543210)" },
    { name: "instagram", label: "Instagram handle", hint: "Without @" },
    { name: "address", label: "Office address" },
    { name: "announcement", label: "Announcement bar", hint: "Shown at the top of the website. Leave empty to hide." },
  ];
  return (
    <form {...formProps} className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={f.name === "address" || f.name === "announcement" ? "sm:col-span-2" : ""}>
          <label htmlFor={`s-${f.name}`} className="label">{f.label}</label>
          <input
            id={`s-${f.name}`}
            name={f.name}
            type={f.type ?? "text"}
            defaultValue={settings[f.name]}
            aria-invalid={err[f.name] ? true : undefined}
            aria-describedby={`s-${f.name}-hint`}
            className="field"
          />
          <p id={`s-${f.name}-hint`} className={`mt-1 text-xs ${err[f.name] ? "text-err" : "text-slate"}`}>
            {err[f.name] ?? f.hint}
          </p>
        </div>
      ))}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm disabled:opacity-60">
          {pending ? "Saving…" : "Save settings"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}
