/*
 * Chart series colours resolve per theme (see --series-* in globals.css):
 * validated dark slots vs #0c1120 and light slots vs #ffffff (dataviz validator).
 * Kept outside "use client" modules so Server Components receive real values.
 */
export const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)"] as const;
