"use client";

import { setTheme, useThemeChoice, type ThemeChoice } from "@/lib/theme";

const OPTIONS: { value: ThemeChoice; label: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Light",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </>
    ),
  },
  { value: "dark", label: "Dark", icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /> },
  {
    value: "system",
    label: "System",
    icon: (
      <>
        <rect x="3" y="4.5" width="18" height="12" rx="2" />
        <path d="M8.5 20h7M12 16.5V20" />
      </>
    ),
  },
];

/** Light / Dark / System switch. `full` shows text labels (mobile menu, admin). */
export function ThemeToggle({ full = false, className = "" }: { full?: boolean; className?: string }) {
  const choice = useThemeChoice();
  return (
    <div role="radiogroup" aria-label="Colour theme" className={`${full ? "flex" : "inline-flex"} items-center gap-0.5 rounded-full border border-line bg-snow/[0.04] p-0.5 ${className}`}>
      {OPTIONS.map((o) => {
        const active = choice === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={full ? undefined : `${o.label} theme`}
            title={`${o.label} theme`}
            onClick={() => setTheme(o.value)}
            className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-300 ${full ? "flex-1 justify-center px-3 py-1.5 text-xs" : "size-8 justify-center"} ${
              active ? "bg-snow text-night shadow-sm" : "text-mist hover:bg-snow/10 hover:text-snow"
            }`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {o.icon}
            </svg>
            {full && o.label}
          </button>
        );
      })}
    </div>
  );
}
