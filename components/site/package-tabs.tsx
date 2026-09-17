"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { TourPackage } from "@/lib/types";
import { Icon } from "../ui";

const TABS = ["Overview", "Itinerary", "Inclusions"] as const;

export function PackageTabs({ pkg }: { pkg: TourPackage }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [openDay, setOpenDay] = useState(0);
  const base = useId();

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    const next = TABS[(i + dir + TABS.length) % TABS.length];
    setTab(next);
    document.getElementById(`${base}-${next}`)?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Package details" className="glass inline-flex rounded-full p-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            id={`${base}-${t}`}
            role="tab"
            type="button"
            aria-selected={tab === t}
            aria-controls={`${base}-${t}-panel`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            onKeyDown={(e) => onKey(e, i)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-500 ${
              tab === t ? "bg-snow text-night shadow" : "text-mist hover:text-snow"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div key={tab} id={`${base}-${tab}-panel`} role="tabpanel" aria-labelledby={`${base}-${tab}`} className="rise mt-6">
        {tab === "Overview" && (
          <div>
            <p className="text-lg leading-relaxed text-snow/90">{pkg.description}</p>
            <h2 className="mt-8 text-lg font-semibold">Highlights</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {pkg.highlights.map((h) => (
                <li key={h} className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-aurora-2 text-on-accent">
                    <Icon name="sparkle" className="size-3.5" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
            {pkg.gallery.length > 0 && (
              <ul className="mt-6 grid grid-cols-3 gap-3">
                {pkg.gallery.slice(0, 3).map((src) => (
                  <li key={src} className="img-zoom relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={src} alt={`${pkg.title} scenery`} fill sizes="(min-width: 1024px) 20vw, 33vw" className="object-cover" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "Itinerary" && (
          <ol className="relative">
            <span aria-hidden="true" className="absolute top-4 bottom-4 left-[1.05rem] w-px bg-aurora-v opacity-40" />
            {pkg.itinerary.map((d, i) => {
              const open = openDay === i;
              return (
                <li key={i} className="relative pl-12">
                  <span
                    aria-hidden="true"
                    className={`absolute top-3.5 left-0 grid size-[2.1rem] place-items-center rounded-full border text-xs font-semibold transition-all duration-500 ${
                      open ? "border-transparent bg-aurora-2 text-on-accent" : "border-line bg-night-2 text-mist"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenDay(open ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 rounded-xl py-4 text-left"
                    >
                      <span className="font-display text-lg font-medium">
                        <span className="sr-only">Day {i + 1}: </span>
                        {d.title}
                      </span>
                      <span aria-hidden="true" className={`text-mist transition-transform duration-500 ${open ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                  </h3>
                  <div className={`grid transition-[grid-template-rows] duration-500 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden" inert={!open}>
                      <p className="text-mist">{d.detail}</p>
                      <dl className="mt-3 mb-4 flex flex-wrap gap-2 text-xs">
                        {[
                          ["Stay", d.stay],
                          ["Meals", d.meals],
                          ["Travel", d.travel],
                        ]
                          .filter(([, v]) => v)
                          .map(([k, v]) => (
                            <div key={k} className="glass rounded-full px-3 py-1">
                              <dt className="inline text-slate">{k}: </dt>
                              <dd className="inline">{v}</dd>
                            </div>
                          ))}
                      </dl>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {tab === "Inclusions" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Included", items: pkg.inclusions, icon: "check" as const, tone: "text-glacier" },
              { title: "Not included", items: pkg.exclusions, icon: "x" as const, tone: "text-err" },
            ].map((col) => (
              <div key={col.title} className="glass rounded-2xl p-5">
                <h2 className="font-semibold">{col.title}</h2>
                <ul className="mt-3 space-y-2.5 text-sm text-snow/85">
                  {col.items.map((it) => (
                    <li key={it} className="flex gap-2.5">
                      <Icon name={col.icon} className={`mt-0.5 size-4 shrink-0 ${col.tone}`} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
