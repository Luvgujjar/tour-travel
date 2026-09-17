import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/controls";
import { Card, Kpi, PageHeader, StatusBadge, timeAgo } from "@/components/admin/ui";
import { inr } from "@/components/ui";
import { removePackage, togglePackageStatus } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { listEnquiries } from "@/lib/data/crm";
import { getPackageById, packageStats } from "@/lib/data/packages";

export const metadata: Metadata = { title: "Package" };

export default async function ViewPackagePage({ params }: PageProps<"/admin/packages/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const p = getPackageById(Number(id));
  if (!p) notFound();
  const s = packageStats().find((x) => x.id === p.id) ?? { views: 0, enquiries: 0, booked: 0 };
  const enquiries = listEnquiries().filter((e) => e.packageSlug === p.slug);
  const revenue = enquiries.filter((e) => e.status === "booked").reduce((sum, e) => sum + e.value, 0);

  return (
    <>
      <Link href="/admin/packages" className="text-sm text-mist hover:text-snow">← Packages</Link>
      <div className="mt-3">
        <PageHeader
          title={p.title}
          description={`${p.days} days / ${p.nights} nights · ${p.route.join(" → ")}`}
          actions={
            <>
              {p.status === "published" && (
                <Link href={`/packages/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm">
                  Open on website ↗
                </Link>
              )}
              <form action={togglePackageStatus}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="btn btn-ghost btn-sm" disabled={p.status === "draft" && !p.itinerary.length}>
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </form>
              <Link href={`/admin/packages/${p.id}/edit`} className="btn btn-primary btn-sm">
                Edit
              </Link>
              <form action={removePackage}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton message={`Delete “${p.title}”?`} className="btn btn-ghost btn-sm !border-[#d03b3b]/40 !text-err">
                  Delete
                </ConfirmButton>
              </form>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Page views" value={s.views} hint="All time" />
        <Kpi label="Enquiries" value={s.enquiries} hint="All time" />
        <Kpi label="View → enquiry" value={s.views ? (s.enquiries / s.views) * 100 : 0} format={(n) => `${n.toFixed(1)}%`} hint="Conversion" />
        <Kpi label="Booked revenue" value={revenue} format={inr} hint={`${s.booked} booking${s.booked === 1 ? "" : "s"}`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <Card title="Overview">
            <p className="text-sm leading-relaxed text-snow/90">{p.description || p.summary}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ["Price", `${inr(p.price)} pp`],
                ["Difficulty", p.difficulty],
                ["Season", p.season || "—"],
                ["Group", p.groupSize || "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-line p-3">
                  <dt className="text-xs text-slate">{k}</dt>
                  <dd className="mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card title={`Itinerary (${p.itinerary.length} days)`}>
            <ol className="space-y-2 text-sm">
              {p.itinerary.map((d, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-12 shrink-0 text-xs text-glacier">Day {i + 1}</span>
                  <span>
                    <span className="font-medium">{d.title}</span>
                    <span className="block text-mist">{d.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
          <Card title="Enquiries for this package">
            {enquiries.length ? (
              <ul className="divide-y divide-line text-sm">
                {enquiries.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                    <Link href={`/admin/enquiries/${e.id}`} className="font-medium hover:underline">{e.name}</Link>
                    <span className="flex items-center gap-3">
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-slate">{timeAgo(e.createdAt)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate">No enquiries yet.</p>
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
              <Image src={p.image} alt="" fill sizes="20rem" className="object-cover" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full border border-line px-2 py-0.5">{p.status === "published" ? "● Published" : "○ Draft"}</span>
              {p.featured && <span className="rounded-full border border-[#fab219]/40 px-2 py-0.5 text-warn">★ Featured</span>}
              <span className="rounded-full border border-line px-2 py-0.5 text-slate">/{p.slug}</span>
            </div>
          </Card>
          <Card title="Highlights">
            <ul className="list-inside list-disc space-y-1 text-sm text-mist">
              {p.highlights.map((h) => <li key={h}>{h}</li>)}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
