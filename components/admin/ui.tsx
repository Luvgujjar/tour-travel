import Link from "next/link";
import type { ReactNode } from "react";
import type { EnquiryStatus } from "@/lib/types";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-mist">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`relative min-w-0 rounded-2xl border border-line bg-surface p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Stat tile with a period-over-period delta (text + arrow, never colour alone). */
export function Kpi({ label, value, previous, format = (n) => n.toLocaleString("en-IN"), hint }: { label: string; value: number; previous?: number; format?: (n: number) => string; hint?: string }) {
  let delta: ReactNode = null;
  if (previous !== undefined) {
    if (previous === 0) {
      delta = <span className="text-slate">{value > 0 ? "New this period" : "No change"}</span>;
    } else {
      const pct = ((value - previous) / previous) * 100;
      const up = pct >= 0;
      delta = (
        <span className={up ? "text-good" : "text-bad"}>
          <span aria-hidden="true">{up ? "▲" : "▼"}</span> {Math.abs(pct).toFixed(0)}%{" "}
          <span className="text-slate">vs previous</span>
        </span>
      );
    }
  }
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong">
      <p className="text-xs text-mist">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{format(value)}</p>
      <p className="mt-1 text-xs">{delta ?? <span className="text-slate">{hint}</span>}</p>
    </div>
  );
}

/** Horizontal bar list — single series, value labelled on every row. */
export function BarList({ rows, format = (n) => n.toLocaleString("en-IN"), empty = "No data yet", hrefFor }: { rows: { label: string; n: number; sub?: string }[]; format?: (n: number) => string; empty?: string; hrefFor?: (label: string) => string | null }) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-slate">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => {
        const href = hrefFor?.(r.label);
        const label = (
          <span className="relative z-10 truncate">
            {r.label}
            {r.sub && <span className="ml-2 text-slate">{r.sub}</span>}
          </span>
        );
        return (
          <li key={r.label} className="group relative flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-sm" title={`${r.label}: ${format(r.n)}`}>
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 rounded-[4px] bg-series-1/25 transition-colors group-hover:bg-series-1/40"
              style={{ width: `${Math.max(2, (r.n / max) * 100)}%` }}
            />
            {href ? (
              <Link href={href} className="relative z-10 truncate hover:underline">
                {r.label}
              </Link>
            ) : (
              label
            )}
            <span className="relative z-10 font-medium tabular-nums">{format(r.n)}</span>
          </li>
        );
      })}
    </ul>
  );
}

const STATUS: Record<EnquiryStatus, { label: string; dot: string; icon: string }> = {
  new: { label: "New", dot: "#3987e5", icon: "●" },
  contacted: { label: "Contacted", dot: "#9085e9", icon: "◐" },
  quoted: { label: "Quoted", dot: "#fab219", icon: "◑" },
  booked: { label: "Booked", dot: "#0ca30c", icon: "✓" },
  lost: { label: "Lost", dot: "#d03b3b", icon: "✕" },
};

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-snow/[0.04] px-2 py-0.5 text-xs whitespace-nowrap">
      <span aria-hidden="true" className="text-[0.6rem]" style={{ color: s.dot }}>
        {s.icon}
      </span>
      {s.label}
    </span>
  );
}

export const statusLabel = (s: EnquiryStatus) => STATUS[s].label;

export function Flash({ children, tone = "ok" }: { children: ReactNode; tone?: "ok" | "error" }) {
  return (
    <p
      role="status"
      className={`rise mb-5 rounded-xl border px-4 py-3 text-sm ${
        tone === "ok" ? "border-[#0ca30c]/40 bg-[#0ca30c]/10 text-ok" : "border-[#d03b3b]/40 bg-[#d03b3b]/10 text-err"
      }`}
    >
      {children}
    </p>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line py-14 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-mist">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const timeAgo = (sqliteDate: string) => {
  const t = new Date(`${sqliteDate.replace(" ", "T")}Z`).getTime();
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const fmtDate = (sqliteDate: string) =>
  new Date(`${sqliteDate.replace(" ", "T")}Z`).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
