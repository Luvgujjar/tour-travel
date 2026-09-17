import Link from "next/link";
import { RANGES, type RangeKey } from "@/lib/data/analytics";

export function RangeTabs({ current, basePath }: { current: RangeKey; basePath: string }) {
  return (
    <nav aria-label="Date range" className="inline-flex rounded-full border border-line bg-snow/[0.03] p-1 text-sm">
      {(Object.keys(RANGES) as RangeKey[]).map((r) => (
        <Link
          key={r}
          href={`${basePath}?range=${r}`}
          aria-current={r === current ? "true" : undefined}
          className={`rounded-full px-3 py-1 transition-colors ${r === current ? "bg-snow font-medium text-night" : "text-mist hover:text-snow"}`}
        >
          Last {RANGES[r]} days
        </Link>
      ))}
    </nav>
  );
}
