import type { Metadata } from "next";
import Link from "next/link";
import { LineChart } from "@/components/admin/charts";
import { SERIES } from "@/lib/chart-colors";
import { RangeTabs } from "@/components/admin/range-tabs";
import { BarList, Card, Kpi, PageHeader, StatusBadge, timeAgo } from "@/components/admin/ui";
import { inr } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { dailySeries, overview, parseRange, topClicks, topPages } from "@/lib/data/analytics";
import { demoDataCounts, enquiryPipeline, listEnquiries } from "@/lib/data/crm";
import { listPackages, packageStats } from "@/lib/data/packages";
import { ENQUIRY_STATUSES } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const range = parseRange((await searchParams).range);
  const { current, previous } = overview(range);
  const series = dailySeries(range).map((d) => ({ x: d.day, views: d.views, visitors: d.visitors }));
  const pipeline = enquiryPipeline();
  const recent = listEnquiries().slice(0, 6);
  const packages = listPackages({ includeDrafts: true });
  const stats = packageStats();
  const demo = demoDataCounts();

  const conv = (t: typeof current) => (t.visitors ? (t.enquiries / t.visitors) * 100 : 0);
  const booked = pipeline.find((p) => p.status === "booked");
  const openValue = pipeline.filter((p) => p.status === "quoted").reduce((s, p) => s + p.value, 0);
  const pkgTitle = (slug: string) => packages.find((p) => p.slug === slug)?.title ?? (slug === "custom" ? "Custom trip" : slug || "—");

  const topPackages = stats
    .map((s) => ({ ...s, title: pkgTitle(s.slug) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${admin.u}`}
        description="Here's how Himalayan Escape is performing."
        actions={<RangeTabs current={range} basePath="/admin" />}
      />

      {demo.events + demo.enquiries > 0 && (
        <p className="mb-5 rounded-xl border border-[#fab219]/30 bg-[#fab219]/10 px-4 py-2.5 text-sm text-warn">
          <span aria-hidden="true">⚠ </span>
          Showing sample data ({demo.events.toLocaleString("en-IN")} demo events, {demo.enquiries} demo enquiries).{" "}
          <Link href="/admin/settings#data" className="underline">
            Clear it in Settings
          </Link>{" "}
          when you go live.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Page views" value={current.views} previous={previous.views} />
        <Kpi label="Unique visitors" value={current.visitors} previous={previous.visitors} />
        <Kpi label="Clicks" value={current.clicks} previous={previous.clicks} />
        <Kpi label="Enquiries" value={current.enquiries} previous={previous.enquiries} />
        <Kpi label="Visitor → enquiry" value={conv(current)} previous={conv(previous) || undefined} format={(n) => `${n.toFixed(1)}%`} hint="Conversion rate" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Traffic" className="lg:col-span-2" action={<Link href={`/admin/analytics?range=${range}`} className="text-xs text-mist hover:text-snow">Full analytics →</Link>}>
          <LineChart
            caption={`Daily page views and unique visitors, last ${series.length} days`}
            data={series}
            series={[
              { key: "views", label: "Views", color: SERIES[0] },
              { key: "visitors", label: "Visitors", color: SERIES[1] },
            ]}
          />
        </Card>

        <Card title="Sales pipeline" action={<Link href="/admin/enquiries" className="text-xs text-mist hover:text-snow">Open CRM →</Link>}>
          <ul className="space-y-2">
            {ENQUIRY_STATUSES.map((s) => {
              const row = pipeline.find((p) => p.status === s)!;
              return (
                <li key={s}>
                  <Link href={`/admin/enquiries?status=${s}`} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 transition-colors hover:border-line-strong hover:bg-snow/[0.03]">
                    <StatusBadge status={s} />
                    <span className="text-sm tabular-nums">
                      <span className="font-semibold">{row.n}</span>
                      {row.value > 0 && <span className="ml-2 text-slate">{inr(row.value)}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-xs text-slate">Booked revenue</dt>
              <dd className="font-display text-lg font-semibold">{inr(booked?.value ?? 0)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate">Open quotes</dt>
              <dd className="font-display text-lg font-semibold">{inr(openValue)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Top pages">
          <BarList rows={topPages(range, 6).map((r) => ({ label: r.label, n: r.n }))} />
        </Card>
        <Card title="Most clicked">
          <BarList rows={topClicks(range, 6).map((r) => ({ label: r.label, n: r.n }))} />
        </Card>
        <Card title="Package interest (all time)" action={<Link href="/admin/packages" className="text-xs text-mist hover:text-snow">Manage →</Link>}>
          <BarList rows={topPackages.map((p) => ({ label: p.title, n: p.views, sub: `${p.enquiries} enq.` }))} hrefFor={(label) => {
            const p = topPackages.find((x) => x.title === label);
            return p ? `/admin/packages/${p.id}` : null;
          }} />
        </Card>
      </div>

      <Card title="Latest enquiries" className="mt-4" action={<Link href="/admin/enquiries" className="text-xs text-mist hover:text-snow">View all →</Link>}>
        {recent.length ? (
          <div className="relative -mx-2 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs text-slate">
                <tr>
                  <th className="px-2 py-2 font-medium">Traveller</th>
                  <th className="px-2 py-2 font-medium">Journey</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 text-right font-medium">Received</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => (
                  <tr key={e.id} className="border-t border-line transition-colors hover:bg-snow/[0.03]">
                    <td className="px-2 py-2.5">
                      <Link href={`/admin/enquiries/${e.id}`} className="font-medium hover:underline">
                        {e.name}
                      </Link>
                      <span className="block text-xs text-slate">{e.phone || e.email}</span>
                    </td>
                    <td className="px-2 py-2.5 text-mist">
                      {pkgTitle(e.packageSlug)} · {e.travellers} pax
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs text-slate">{timeAgo(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate">No enquiries yet.</p>
        )}
      </Card>
    </>
  );
}
