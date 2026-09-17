"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, ViewTransition } from "react";
import { destinations } from "@/lib/content";
import type { TourPackage } from "@/lib/types";
import { Icon } from "../ui";
import { PackageCard } from "./package-card";

const SORTS = {
  featured: "Recommended",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  duration: "Shortest first",
} as const;
type Sort = keyof typeof SORTS;

export function PackagesExplorer({ packages }: { packages: TourPackage[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const destination = params.get("destination") ?? "";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [level, setLevel] = useState("");

  const setDestination = (d: string) => {
    const next = new URLSearchParams(params);
    if (d) next.set("destination", d);
    else next.delete("destination");
    router.replace(`/packages${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = packages.filter(
      (p) =>
        (!destination || p.route.includes(destination)) &&
        (!level || p.difficulty === level) &&
        (!q || `${p.title} ${p.route.join(" ")} ${p.summary}`.toLowerCase().includes(q)),
    );
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "duration") list.sort((a, b) => a.days - b.days);
    return list;
  }, [packages, destination, level, query, sort]);

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition-all duration-500 ${
      active ? "border-transparent bg-snow text-night" : "border-line bg-snow/[0.03] text-mist hover:border-line-strong hover:text-snow"
    }`;

  return (
    <div className="container-x">
      <div className="glass flex flex-col gap-3 rounded-2xl p-3 lg:flex-row lg:items-center">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Filter by destination">
          <button type="button" className={chip(!destination)} aria-pressed={!destination} onClick={() => setDestination("")}>
            All
          </button>
          {destinations.map((d) => (
            <button
              key={d.slug}
              type="button"
              className={`${chip(destination === d.slug)} shrink-0`}
              aria-pressed={destination === d.slug}
              onClick={() => setDestination(destination === d.slug ? "" : d.slug)}
            >
              {d.name}
            </button>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 sm:flex sm:flex-row lg:justify-end">
          <label className="relative col-span-2 sm:w-56">
            <span className="sr-only">Search packages</span>
            <svg viewBox="0 0 20 20" aria-hidden="true" className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate">
              <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search journeys…" className="field !py-2 !pl-10" />
          </label>
          <label>
            <span className="sr-only">Difficulty</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="field !py-2">
              <option value="">Any difficulty</option>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Challenging</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !py-2">
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mt-5 text-sm text-mist" aria-live="polite">
        {results.length} {results.length === 1 ? "journey" : "journeys"}
        {destination ? ` through ${destinations.find((d) => d.slug === destination)?.name ?? destination}` : ""}
      </p>

      {results.length ? (
        <ul className="scroll-3d mt-4 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {results.map((p, i) => (
            <ViewTransition key={p.id}>
              <li className="rise" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
                <PackageCard pkg={p} priority={i < 3} />
              </li>
            </ViewTransition>
          ))}
        </ul>
      ) : (
        <div className="glass mt-4 flex flex-col items-center rounded-3xl py-16 text-center">
          <Icon name="mountain" className="size-10 text-slate" />
          <p className="mt-4 font-display text-xl">No journeys match those filters</p>
          <p className="mt-1 text-mist">Try another destination — or ask us to design one.</p>
          <a href="#plan" className="btn btn-primary btn-sm mt-5">
            Plan a custom trip
          </a>
        </div>
      )}
    </div>
  );
}
