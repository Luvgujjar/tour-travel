"use client";

import { addEnquiry, saveEnquiry, type FormState } from "@/lib/actions/admin";
import { useActionForm } from "@/lib/use-action-form";
import { ENQUIRY_STATUSES, type Enquiry } from "@/lib/types";

const LABELS: Record<string, string> = { new: "New", contacted: "Contacted", quoted: "Quoted", booked: "Booked", lost: "Lost" };

export function EnquiryEditForm({ enquiry }: { enquiry: Enquiry }) {
  const { state, pending, formProps } = useActionForm<FormState>(saveEnquiry, null);
  return (
    <form {...formProps} className="space-y-4">
      <input type="hidden" name="id" value={enquiry.id} />
      <fieldset>
        <legend className="label">Pipeline stage</legend>
        <div className="flex flex-wrap gap-1 rounded-xl border border-line p-1">
          {ENQUIRY_STATUSES.map((s) => (
            <label key={s} className="flex-1 cursor-pointer">
              <input type="radio" name="status" value={s} defaultChecked={enquiry.status === s} className="peer sr-only" />
              <span className="block rounded-lg px-2 py-1.5 text-center text-xs whitespace-nowrap text-mist transition-colors peer-checked:bg-snow peer-checked:font-medium peer-checked:text-night peer-focus-visible:ring-2 peer-focus-visible:ring-sky hover:bg-snow/5">
                {LABELS[s]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="value" className="label">Quoted / booked value (₹)</label>
        <input id="value" name="value" inputMode="numeric" defaultValue={enquiry.value || ""} placeholder="e.g. 43998" className="field" />
      </div>
      <div>
        <label htmlFor="notes" className="label">Internal notes</label>
        <textarea id="notes" name="notes" rows={6} defaultValue={enquiry.notes} placeholder="Call summary, preferences, follow-up date…" className="field" />
      </div>
      {state && (
        <p role="status" className={`text-sm ${state.ok ? "text-ok" : "text-err"}`}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function NewEnquiryForm({ packages }: { packages: { slug: string; title: string }[] }) {
  const { state, pending, formProps } = useActionForm<FormState>(addEnquiry, null);
  return (
    <form {...formProps} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="name" className="label">Name *</label>
        <input id="name" name="name" required className="field" aria-invalid={state?.errors?.name ? true : undefined} />
      </div>
      <div>
        <label htmlFor="phone" className="label">Phone</label>
        <input id="phone" name="phone" type="tel" className="field" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" className="field" />
      </div>
      <div>
        <label htmlFor="package" className="label">Journey</label>
        <select id="package" name="package" className="field">
          {packages.map((p) => (
            <option key={p.slug} value={p.slug}>{p.title}</option>
          ))}
          <option value="custom">Custom trip</option>
        </select>
      </div>
      <div>
        <label htmlFor="source" className="label">Source</label>
        <select id="source" name="source" className="field">
          <option value="phone">Phone call</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="walk-in">Walk-in</option>
          <option value="referral">Referral</option>
          <option value="manual">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="month" className="label">Travel month</label>
        <input id="month" name="month" type="month" className="field" />
      </div>
      <div>
        <label htmlFor="guests" className="label">Travellers</label>
        <input id="guests" name="guests" type="number" min={1} max={50} defaultValue={2} className="field" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="notes" className="label">Message / notes</label>
        <textarea id="notes" name="notes" rows={4} className="field" />
      </div>
      {state && !state.ok && <p role="alert" className="text-sm text-err sm:col-span-2">{state.message}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Create lead"}
        </button>
      </div>
    </form>
  );
}
