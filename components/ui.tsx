import type { CSSProperties, ReactNode } from "react";

export const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Splits text into words that slide up one after another when an ancestor becomes visible. */
export function SplitWords({ text, className = "", offset = 0 }: { text: string; className?: string; offset?: number }) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((w, i) => (
          <span key={i}>
            <span className="split-word">
              <span style={{ "--i": i + offset } as CSSProperties}>{w}</span>
            </span>{" "}
          </span>
        ))}
      </span>
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center rounded-xl bg-aurora-logo shadow-[0_8px_24px_-8px_var(--glow)]">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 text-night">
          <path d="M2 19 9 7l3.5 5.5L15 9l7 10H2Z" fill="currentColor" />
          <path d="m7.4 10 1.6 1.2 1.3-1" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight">
          Himalayan<span className="ml-1 text-mist">Escape</span>
        </span>
      )}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  intro,
  align = "left",
  id,
  as: Tag = "h2",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: ReactNode;
  align?: "left" | "center";
  id?: string;
  as?: "h1" | "h2";
}) {
  const centered = align === "center";
  return (
    <div data-reveal="fade" className={`max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <Tag id={id} className="mt-5 text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl">
        <SplitWords text={title} />
        {accent ? (
          <>
            {" "}
            <span className="accent text-gradient pr-1 font-normal">{accent}</span>
          </>
        ) : null}
      </Tag>
      {intro ? (
        <p className={`mt-5 max-w-xl text-base leading-relaxed text-mist sm:text-lg ${centered ? "mx-auto" : ""}`}>{intro}</p>
      ) : null}
    </div>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`arrow size-4 ${className}`}>
      <path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const paths = {
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  route: <path d="M5 19c3 0 3-6 7-6s4-6 7-6M5 19a1.5 1.5 0 1 0 0-.01M19 7a1.5 1.5 0 1 0 0-.01" />,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
  users: <><circle cx="9" cy="9" r="3" /><circle cx="16.5" cy="10" r="2.3" /><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M15 14.6c2.7-.3 4.8 1 5.3 3.9" /></>,
  mountain: <path d="M2.5 19 9 8l3.5 5.5L15 10l6.5 9h-19Z" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15 9-2 4-4 2 2-4 4-2Z" /></>,
  shield: <path d="M12 3.5 5 6v5.5c0 4 3 7.3 7 9 4-1.7 7-5 7-9V6l-7-2.5ZM9 12l2 2 4-4" />,
  support: <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><rect x="3" y="13" width="4" height="6" rx="2" /><rect x="17" y="13" width="4" height="6" rx="2" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  phone: <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></>,
  whatsapp: <path d="M4 20l1.2-4A8 8 0 1 1 8 18.8L4 20Zm5-11.5c0 3.5 3 6.5 6.5 6.5l1.3-1.5-2-1-1 .9a5 5 0 0 1-2.7-2.7l.9-1-1-2L9 8.5Z" />,
  sparkle: <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" />,
  star: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6L12 4Z" />,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}
