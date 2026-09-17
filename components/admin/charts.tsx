"use client";

import { useEffect, useId, useRef, useState } from "react";

type Series = { key: string; label: string; color: string };
type Datum = { x: string } & Record<string, number | string>;

const fmtDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtNum = (n: number) => n.toLocaleString("en-IN");

function niceMax(v: number) {
  if (v <= 4) return 4;
  const mag = 10 ** Math.floor(Math.log10(v));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * mag;
}

function useWidth<T extends HTMLElement>(fallback = 320) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function Legend({ series, kind }: { series: Series[]; kind: "line" | "rect" }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          {kind === "line" ? (
            <span className="h-0.5 w-3.5 rounded-full" style={{ background: s.color }} />
          ) : (
            <span className="size-2.5 rounded-[3px]" style={{ background: s.color }} />
          )}
          {s.label}
        </li>
      ))}
    </ul>
  );
}

function TableView({ data, series, caption }: { data: Datum[]; series: Series[]; caption: string }) {
  return (
    <details className="mt-3 text-xs">
      <summary className="cursor-pointer text-slate hover:text-mist">View as table</summary>
      <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-line">
        <table className="w-full text-left tabular-nums">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-night-3 text-slate">
            <tr>
              <th className="px-3 py-1.5 font-medium">Date</th>
              {series.map((s) => (
                <th key={s.key} className="px-3 py-1.5 text-right font-medium">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.x} className="border-t border-line">
                <td className="px-3 py-1">{fmtDay(d.x)}</td>
                {series.map((s) => (
                  <td key={s.key} className="px-3 py-1 text-right">
                    {fmtNum(Number(d[s.key]))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Tooltip({ x, y, width, title, rows }: { x: number; y: number; width: number; title: string; rows: { label: string; value: number; color: string; kind: "line" | "rect" }[] }) {
  const left = Math.min(Math.max(x + 12, 0), width - 150);
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 w-[140px] rounded-lg border border-line-strong bg-night-3/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
      style={{ left, top: y }}
    >
      <p className="mb-1 text-slate">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2">
          <span className={r.kind === "line" ? "h-0.5 w-3 rounded-full" : "size-2 rounded-[2px]"} style={{ background: r.color }} />
          <span className="font-semibold text-snow tabular-nums">{fmtNum(r.value)}</span>
          <span className="text-mist">{r.label}</span>
        </p>
      ))}
    </div>
  );
}

/** Multi-series line chart over days, with crosshair tooltip, direct end labels and a table view. */
export function LineChart({ data, series, height = 240, caption }: { data: Datum[]; series: Series[]; height?: number; caption: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();

  const pad = { l: 40, r: 64, t: 12, b: 26 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = niceMax(Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key])))));
  const xAt = (i: number) => pad.l + (data.length <= 1 ? w / 2 : (i / (data.length - 1)) * w);
  const yAt = (v: number) => pad.t + h - (v / max) * h;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const xTicks = data.length ? Array.from({ length: Math.min(6, data.length) }, (_, k) => Math.round((k * (data.length - 1)) / Math.max(1, Math.min(6, data.length) - 1))) : [];

  const path = (key: string) => data.map((d, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)},${yAt(Number(d[key])).toFixed(1)}`).join("");

  const pick = (clientX: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box || !data.length) return;
    const rel = (clientX - box.left - pad.l) / w;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(rel * (data.length - 1)))));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover((h0) => Math.max(0, Math.min(data.length - 1, (h0 ?? data.length - 1) + (e.key === "ArrowRight" ? 1 : -1))));
  };

  const last = data.length - 1;

  return (
    <div>
      {series.length > 1 && <Legend series={series} kind="line" />}
      <div ref={ref} className="relative mt-3">
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${caption}. Use left and right arrow keys to read values.`}
          tabIndex={0}
          onPointerMove={(e) => pick(e.clientX)}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
          className="block overflow-visible outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-sky/60"
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={{ stopColor: series[0]?.color, stopOpacity: 0.22 }} />
              <stop offset="1" style={{ stopColor: series[0]?.color, stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + w} y1={yAt(t)} y2={yAt(t)} style={{ stroke: t === 0 ? "var(--baseline)" : "var(--grid)" }} />
              <text x={pad.l - 8} y={yAt(t)} dy="0.32em" textAnchor="end" className="fill-slate text-[10px] tabular-nums">
                {fmtNum(t)}
              </text>
            </g>
          ))}
          {xTicks.map((i) => (
            <text key={i} x={xAt(i)} y={height - 6} textAnchor="middle" className="fill-slate text-[10px]">
              {fmtDay(String(data[i].x))}
            </text>
          ))}
          {data.length > 1 && series[0] && (
            <path d={`${path(series[0].key)}L${xAt(last)},${yAt(0)}L${xAt(0)},${yAt(0)}Z`} fill={`url(#${gradId})`} />
          )}
          {series.map((s) => (
            <path key={s.key} d={path(s.key)} fill="none" style={{ stroke: s.color }} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {/* Direct end labels */}
          {last >= 0 &&
            series.map((s, k) => (
              <text
                key={s.key}
                x={xAt(last) + 8}
                y={yAt(Number(data[last][s.key])) + (k === 0 ? -6 : 10)}
                className="fill-mist text-[10px] tabular-nums"
              >
                {fmtNum(Number(data[last][s.key]))} {s.label.toLowerCase()}
              </text>
            ))}
          {hover !== null && (
            <g>
              <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.t} y2={pad.t + h} style={{ stroke: "var(--baseline)" }} />
              {series.map((s) => (
                <circle key={s.key} cx={xAt(hover)} cy={yAt(Number(data[hover][s.key]))} r="4" style={{ fill: s.color, stroke: "var(--surface)" }} strokeWidth="2" />
              ))}
            </g>
          )}
        </svg>
        {hover !== null && (
          <Tooltip
            x={xAt(hover)}
            y={pad.t}
            width={width}
            title={fmtDay(String(data[hover].x))}
            rows={series.map((s) => ({ label: s.label, value: Number(data[hover][s.key]), color: s.color, kind: "line" }))}
          />
        )}
      </div>
      <TableView data={data} series={series} caption={caption} />
    </div>
  );
}

/** Single-series daily column chart with per-bar hover. */
export function ColumnChart({ data, series, height = 200, caption }: { data: Datum[]; series: Series; height?: number; caption: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const pad = { l: 32, r: 8, t: 12, b: 26 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = niceMax(Math.max(1, ...data.map((d) => Number(d[series.key]))));
  const slot = w / Math.max(1, data.length);
  const barW = Math.max(2, slot - 2);
  const yAt = (v: number) => pad.t + h - (v / max) * h;
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));
  const xTicks = data.length ? Array.from({ length: Math.min(5, data.length) }, (_, k) => Math.round((k * (data.length - 1)) / Math.max(1, Math.min(5, data.length) - 1))) : [];

  const bar = (i: number, v: number) => {
    const x = pad.l + i * slot + 1;
    const y = yAt(v);
    const bh = pad.t + h - y;
    if (bh <= 0) return "";
    const r = Math.min(4, barW / 2, bh);
    return `M${x},${pad.t + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + barW - r}Q${x + barW},${y} ${x + barW},${y + r}V${pad.t + h}Z`;
  };

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={height} role="img" aria-label={caption} className="block overflow-visible">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + w} y1={yAt(t)} y2={yAt(t)} style={{ stroke: t === 0 ? "var(--baseline)" : "var(--grid)" }} />
              <text x={pad.l - 8} y={yAt(t)} dy="0.32em" textAnchor="end" className="fill-slate text-[10px] tabular-nums">
                {fmtNum(t)}
              </text>
            </g>
          ))}
          {xTicks.map((i) => (
            <text key={i} x={pad.l + i * slot + slot / 2} y={height - 6} textAnchor="middle" className="fill-slate text-[10px]">
              {fmtDay(String(data[i].x))}
            </text>
          ))}
          {data.map((d, i) => {
            const v = Number(d[series.key]);
            return (
              <g key={d.x}>
                <path d={bar(i, v)} style={{ fill: series.color }} opacity={hover === null || hover === i ? 1 : 0.45} className="transition-opacity" />
                {/* Hit target spans the full slot height */}
                <rect
                  x={pad.l + i * slot}
                  y={pad.t}
                  width={slot}
                  height={h}
                  fill="transparent"
                  tabIndex={-1}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                >
                  <title>{`${fmtDay(String(d.x))}: ${fmtNum(v)} ${series.label.toLowerCase()}`}</title>
                </rect>
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <Tooltip
            x={pad.l + hover * slot}
            y={pad.t}
            width={width}
            title={fmtDay(String(data[hover].x))}
            rows={[{ label: series.label, value: Number(data[hover][series.key]), color: series.color, kind: "rect" }]}
          />
        )}
      </div>
      <TableView data={data} series={[series]} caption={caption} />
    </div>
  );
}
