import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin/controls";
import { Card, EmptyState, Flash, PageHeader } from "@/components/admin/ui";
import { inr } from "@/components/ui";
import { duplicatePackage, removePackage, togglePackageFeatured, togglePackageStatus } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { listPackages, packageStats } from "@/lib/data/packages";

export const metadata: Metadata = { title: "Packages" };

const iconBtn = "rounded-md border border-line px-2 py-1 text-xs transition-colors hover:bg-snow/10";

export default async function AdminPackages({ searchParams }: PageProps<"/admin/packages">) {
  await requireAdmin();
  const sp = await searchParams;
  const packages = listPackages({ includeDrafts: true });
  const stats = packageStats();
  const published = packages.filter((p) => p.status === "published").length;

  return (
    <>
      <PageHeader
        title="Packages"
        description={`${packages.length} total · ${published} published · ${packages.length - published} draft`}
        actions={
          <Link href="/admin/packages/new" className="btn btn-primary btn-sm">
            + New package
          </Link>
        }
      />
      {sp.saved && <Flash>Package saved. The website has been updated.</Flash>}
      {sp.deleted && <Flash>Package deleted.</Flash>}

      {packages.length ? (
        <Card className="!p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-line text-xs text-slate">
                <tr>
                  <th className="px-4 py-3 font-medium">Package</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Views</th>
                  <th className="px-4 py-3 text-right font-medium">Enquiries</th>
                  <th className="px-4 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => {
                  const s = stats.find((x) => x.id === p.id);
                  return (
                    <tr key={p.id} className={`border-t border-line transition-colors hover:bg-snow/[0.03] ${String(p.id) === sp.saved ? "bg-[#0ca30c]/[0.06]" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                            <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                          </span>
                          <span className="min-w-0">
                            <Link href={`/admin/packages/${p.id}`} className="font-medium hover:underline">
                              {p.title}
                            </Link>
                            <span className="block truncate text-xs text-slate">{p.route.join(" · ")}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-mist">{p.days}D / {p.nights}N</td>
                      <td className="px-4 py-3 text-right tabular-nums">{inr(p.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <form action={togglePackageStatus}>
                            <input type="hidden" name="id" value={p.id} />
                            <button
                              type="submit"
                              title={p.status === "published" ? "Click to unpublish" : "Click to publish"}
                              className={`rounded-full border px-2 py-0.5 text-xs ${p.status === "published" ? "border-[#0ca30c]/40 text-ok" : "border-line text-mist"}`}
                            >
                              {p.status === "published" ? "● Published" : "○ Draft"}
                            </button>
                          </form>
                          <form action={togglePackageFeatured}>
                            <input type="hidden" name="id" value={p.id} />
                            <button type="submit" title={p.featured ? "Remove from home page" : "Feature on home page"} className={`rounded-full border px-2 py-0.5 text-xs ${p.featured ? "border-[#fab219]/40 text-warn" : "border-line text-slate"}`}>
                              {p.featured ? "★ Featured" : "☆ Feature"}
                            </button>
                          </form>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{(s?.views ?? 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s?.enquiries ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/admin/packages/${p.id}`} className={iconBtn}>View</Link>
                          <Link href={`/admin/packages/${p.id}/edit`} className={iconBtn}>Edit</Link>
                          <form action={duplicatePackage}>
                            <input type="hidden" name="id" value={p.id} />
                            <button type="submit" className={iconBtn}>Duplicate</button>
                          </form>
                          <form action={removePackage}>
                            <input type="hidden" name="id" value={p.id} />
                            <ConfirmButton message={`Delete “${p.title}”? This removes it from the website and cannot be undone.`} title={`Delete ${p.title}`} className="rounded-md border border-[#d03b3b]/40 px-2 py-1 text-xs text-err hover:bg-[#d03b3b]/15">
                              Delete
                            </ConfirmButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState title="No packages yet" text="Create your first journey." action={<Link href="/admin/packages/new" className="btn btn-primary btn-sm">+ New package</Link>} />
      )}
    </>
  );
}
