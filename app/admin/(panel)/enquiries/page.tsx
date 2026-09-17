import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/controls";
import { Card, EmptyState, Flash, PageHeader, StatusBadge, statusLabel, timeAgo } from "@/components/admin/ui";
import { inr } from "@/components/ui";
import { quickStatus, removeEnquiry } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { enquiryPipeline, listEnquiries } from "@/lib/data/crm";
import { listPackages } from "@/lib/data/packages";
import { ENQUIRY_STATUSES } from "@/lib/types";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const enquiries = listEnquiries({ status, q });
  const pipeline = enquiryPipeline();
  const total = pipeline.reduce((s, p) => s + p.n, 0);
  const packages = listPackages({ includeDrafts: true });
  const pkgTitle = (slug: string) => packages.find((p) => p.slug === slug)?.title ?? (slug === "custom" ? "Custom trip" : slug || "—");

  const tabHref = (s: string) => `/admin/enquiries?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(q ? { q } : {}) })}`;
  const exportHref = `/api/admin/enquiries/export?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}) })}`;

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Your CRM — track every lead from first message to booking."
        actions={
          <>
            <a href={exportHref} className="btn btn-ghost btn-sm">
              Export CSV
            </a>
            <Link href="/admin/enquiries/new" className="btn btn-primary btn-sm">
              + Add lead
            </Link>
          </>
        }
      />
      {sp.deleted && <Flash>Enquiry deleted.</Flash>}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-line bg-snow/[0.03] p-1 text-sm">
          {[{ s: "", label: "All", n: total }, ...ENQUIRY_STATUSES.map((s) => ({ s, label: statusLabel(s), n: pipeline.find((p) => p.status === s)?.n ?? 0 }))].map((t) => (
            <Link
              key={t.s || "all"}
              href={tabHref(t.s)}
              aria-current={status === t.s ? "true" : undefined}
              className={`shrink-0 rounded-full px-3 py-1 transition-colors ${status === t.s ? "bg-snow font-medium text-night" : "text-mist hover:text-snow"}`}
            >
              {t.label} <span className="tabular-nums opacity-60">{t.n}</span>
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="q" className="sr-only">Search enquiries</label>
          <input id="q" name="q" defaultValue={q} placeholder="Search name, phone, package…" className="field !py-2 lg:w-72" />
          <button className="btn btn-ghost btn-sm" type="submit">Search</button>
        </form>
      </div>

      {enquiries.length ? (
        <Card className="!p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-line text-xs text-slate">
                <tr>
                  <th className="px-4 py-3 font-medium">Traveller</th>
                  <th className="px-4 py-3 font-medium">Journey</th>
                  <th className="px-4 py-3 font-medium">Travel</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e.id} className="border-t border-line align-top transition-colors hover:bg-snow/[0.03]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/enquiries/${e.id}`} className="font-medium hover:underline">
                        {e.name}
                      </Link>
                      {e.isDemo && <span className="ml-1.5 rounded bg-[#fab219]/15 px-1 text-[0.6rem] text-warn">demo</span>}
                      <span className="block text-xs text-slate">{[e.phone, e.email].filter(Boolean).join(" · ")}</span>
                    </td>
                    <td className="px-4 py-3">
                      {pkgTitle(e.packageSlug)}
                      <span className="block text-xs text-slate">via {e.source}</span>
                    </td>
                    <td className="px-4 py-3 text-mist">
                      {e.travelMonth || "Flexible"}
                      <span className="block text-xs text-slate">{e.travellers} traveller{e.travellers > 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3">
                      <form action={quickStatus} className="flex items-center gap-1.5">
                        <input type="hidden" name="id" value={e.id} />
                        <StatusBadge status={e.status} />
                        <label className="sr-only" htmlFor={`st-${e.id}`}>Change status for {e.name}</label>
                        <select id={`st-${e.id}`} name="status" defaultValue={e.status} className="rounded-md border border-line bg-night-3 px-1 py-0.5 text-xs">
                          {ENQUIRY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel(s)}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="rounded-md border border-line px-1.5 py-0.5 text-xs hover:bg-snow/10">
                          Set
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{e.value ? inr(e.value) : "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate">{timeAgo(e.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/enquiries/${e.id}`} className="rounded-md border border-line px-2 py-1 text-xs hover:bg-snow/10">
                          Open
                        </Link>
                        <form action={removeEnquiry}>
                          <input type="hidden" name="id" value={e.id} />
                          <ConfirmButton message={`Delete the enquiry from ${e.name}? This cannot be undone.`} title={`Delete enquiry from ${e.name}`} className="rounded-md border border-[#d03b3b]/40 px-2 py-1 text-xs text-err hover:bg-[#d03b3b]/15">
                            Delete
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState title="No enquiries found" text={q || status ? "Try a different filter or search." : "New website enquiries will appear here."} />
      )}
    </>
  );
}
