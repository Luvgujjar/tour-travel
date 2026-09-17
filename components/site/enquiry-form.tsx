"use client";

import { submitEnquiry, type EnquiryState } from "@/lib/actions/public";
import { whatsappLink } from "@/lib/content";
import { useActionForm } from "@/lib/use-action-form";
import { Arrow, Icon } from "../ui";

type Option = { slug: string; title: string };

export function EnquiryForm({
  packages,
  whatsapp,
  source,
  defaultPackage = "",
  compact = false,
  onDone,
}: {
  packages: Option[];
  whatsapp: string;
  source: "plan-dialog" | "contact" | "package-page";
  defaultPackage?: string;
  compact?: boolean;
  onDone?: () => void;
}) {
  const { state, pending, formProps } = useActionForm<EnquiryState | null>(submitEnquiry, null);
  const err = state?.errors ?? {};

  if (state?.ok) {
    return (
      <div role="status" className="rise flex flex-col items-center py-8 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-aurora-2 text-on-accent">
          <Icon name="check" className="size-7" />
        </span>
        <p className="mt-5 font-display text-2xl font-semibold">Enquiry received</p>
        <p className="mt-2 max-w-sm text-mist">{state.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            <Icon name="whatsapp" className="size-4" /> Chat now on WhatsApp
          </a>
          {onDone && (
            <button type="button" onClick={onDone} className="btn btn-ghost btn-sm">
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  const fieldProps = (name: string) => ({
    name,
    id: `${source}-${name}`,
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `${source}-${name}-err` : undefined,
    className: "field",
  });
  const errorText = (name: string) =>
    err[name] ? (
      <p id={`${source}-${name}-err`} className="mt-1.5 text-xs text-err">
        {err[name]}
      </p>
    ) : null;

  return (
    <form {...formProps} noValidate className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
      <input type="hidden" name="source" value={source} />
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className={compact ? "" : "sm:col-span-2"}>
        <label className="label" htmlFor={`${source}-name`}>Your name</label>
        <input {...fieldProps("name")} autoComplete="name" placeholder="Full name" required />
        {errorText("name")}
      </div>
      <div>
        <label className="label" htmlFor={`${source}-phone`}>Phone / WhatsApp</label>
        <input {...fieldProps("phone")} type="tel" autoComplete="tel" placeholder="+91 98xxx xxxxx" />
        {errorText("phone")}
      </div>
      <div>
        <label className="label" htmlFor={`${source}-email`}>Email</label>
        <input {...fieldProps("email")} type="email" autoComplete="email" placeholder="you@example.com" />
        {errorText("email")}
      </div>
      <div className={compact ? "" : "sm:col-span-2"}>
        <label className="label" htmlFor={`${source}-package`}>Journey</label>
        <select {...fieldProps("package")} defaultValue={defaultPackage || packages[0]?.slug}>
          {packages.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
          <option value="custom">Something custom</option>
        </select>
      </div>
      <div className={compact ? "grid grid-cols-2 gap-4" : "contents"}>
        <div>
          <label className="label" htmlFor={`${source}-month`}>Travel month</label>
          <input {...fieldProps("month")} type="month" />
          {errorText("month")}
        </div>
        <div>
          <label className="label" htmlFor={`${source}-guests`}>Travellers</label>
          <input {...fieldProps("guests")} type="number" min={1} max={50} defaultValue={2} />
        </div>
      </div>
      <div className={compact ? "" : "sm:col-span-2"}>
        <label className="label" htmlFor={`${source}-notes`}>Anything else?</label>
        <textarea {...fieldProps("notes")} rows={compact ? 2 : 3} placeholder="Honeymoon, trekking, travelling with kids…" />
      </div>

      {state && !state.ok && (
        <p role="alert" className={`text-sm text-err ${compact ? "" : "sm:col-span-2"}`}>
          {state.message}
        </p>
      )}

      <div className={`flex flex-col gap-2 sm:flex-row ${compact ? "" : "sm:col-span-2"}`}>
        <button type="submit" disabled={pending} className="btn btn-primary flex-1 disabled:opacity-60" data-track="Send Enquiry">
          {pending ? "Sending…" : "Send Enquiry"} <Arrow />
        </button>
        <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" data-track="WhatsApp Us">
          <Icon name="whatsapp" className="size-4" /> WhatsApp
        </a>
      </div>
    </form>
  );
}
