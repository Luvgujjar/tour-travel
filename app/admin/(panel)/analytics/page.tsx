import type { Metadata } from "next";
import { ColumnChart, LineChart } from "@/components/admin/charts";
import { SERIES } from "@/lib/chart-colors";
import { RangeTabs } from "@/components/admin/range-tabs";
import { BarList, Card, Kpi, PageHeader, timeAgo } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { dailySeries, overview, parseRange, recentActivity, topClicks, topPages, topReferrers } from "@/lib/data/analytics";
import { listPackages, packageStats } from "@/lib/data/packages";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  await requireAdmin();
  const range = parseRange((await searchParams).range);
  const { current, previous } = overview(range);
  const daily = dailySeries(range);
  const pages = topPages(range, 10);
  const clicks = topClicks(range, 10);
  const referrers = topReferrers(range);
  const activity = recentActivity(10);
  const packages = listPackages({ includeDrafts: true });
  const stats = packageStats();

  const perVisit = current.visitors ? current.views / current.visitors : 0;
  const ctr = current.views ? (current.clicks / current.views) * 100 : 0;

  const pkgRows = packages
    .map((p) => {
      const s = stats.find((x) => x.id === p.id);
      return { ...p, views: s?.views ?? 0, enquiries: s?.enquiries ?? 0, booked: s?.booked ?? 0 };
    })
    .sort((a, b) => b.views - a.views);

  return (
    <>
      <PageHeader title="Analytics" description="First-party, cookie-free tracking of views and clicks on the public website." actions={<RangeTabs current={range} basePath="/admin/analytics" />} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Page views" value={current.views} previous={previous.views} />
        <Kpi label="Unique visitors" value={current.visitors} previous={previous.visitors} />
        <Kpi label="Pages per visitor" value={perVisit} format={(n) => n.toFixed(2)} hint="Views ÷ visitors" />
        <Kpi label="Click-through rate" value={ctr} format={(n) => `${n.toFixed(1)}%`} hint="Clicks ÷ views" />
      </div>

      <Card title="Views & visitors" className="mt-4">
        <LineChart
          caption="Daily page views and unique visitors"
          data={daily.map((d) => ({ x: d.day, views: d.views, visitors: d.visitors }))}
          series={[
            { key: "views", label: "Views", color: SERIES[0] },
            { key: "visitors", label: "Visitors", color: SERIES[1] },
          ]}
          height={260}
        />
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Clicks per day">
          <ColumnChart caption="Daily clicks" data={daily.map((d) => ({ x: d.day, clicks: d.clicks }))} series={{ key: "clicks", label: "Clicks", color: SERIES[0] }} />
        </Card>
        <Card title="Enquiries per day">
          <ColumnChart caption="Daily enquiries" data={daily.map((d) => ({ x: d.day, enquiries: d.enquiries }))} series={{ key: "enquiries", label: "Enquiries", color: SERIES[2] }} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Top pages">
          <BarList rows={pages.map((p) => ({ label: p.label, n: p.n, sub: `${p.unique_n} unique` }))} />
        </Card>
        <Card title="Top clicks (buttons & links)">
          <BarList rows={clicks.map((c) => ({ label: c.label, n: c.n, sub: `${c.pages} ${c.pages === 1 ? "page" : "pages"}` }))} />
        </Card>
        <Card title="Traffic sources (visitors)">
          <BarList rows={referrers} />
        </Card>
      </div>

      <Card title="Package performance (all time)" className="mt-4">
        <div className="relative -mx-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm tabular-nums">
            <thead className="text-xs text-slate">
              <tr>
                <th className="px-2 py-2 font-medium">Package</th>
                <th className="px-2 py-2 text-right font-medium">Page views</th>
                <th className="px-2 py-2 text-right font-medium">Enquiries</th>
                <th className="px-2 py-2 text-right font-medium">Booked</th>
                <th className="px-2 py-2 text-right font-medium">View → enquiry</th>
              </tr>
            </thead>
            <tbody>
              {pkgRows.map((p) => (
                <tr key={p.id} className="border-t border-line hover:bg-snow/[0.03]">
                  <td className="px-2 py-2">
                    {p.title}
                    {p.status === "draft" && <span className="ml-2 rounded bg-snow/10 px-1.5 py-0.5 text-[0.65rem] text-mist">Draft</span>}
                  </td>
                  <td className="px-2 py-2 text-right">{p.views.toLocaleString("en-IN")}</td>
                  <td className="px-2 py-2 text-right">{p.enquiries}</td>
                  <td className="px-2 py-2 text-right">{p.booked}</td>
                  <td className="px-2 py-2 text-right">{p.views ? `${((p.enquiries / p.views) * 100).toFixed(1)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Live activity" className="mt-4">
        <ul className="divide-y divide-line text-sm">
          {activity.map((a, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="rounded bg-snow/[0.06] px-1.5 py-0.5 text-[0.65rem] tracking-wide text-mist uppercase">{a.type}</span>
                <span className="truncate">{a.type === "click" ? `“${a.label}” on ${a.path}` : a.path}</span>
              </span>
              <span className="shrink-0 text-xs text-slate">{timeAgo(a.created_at)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
