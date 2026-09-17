import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/controls";
import { EnquiryEditForm } from "@/components/admin/enquiry-forms";
import { Card, PageHeader, StatusBadge, fmtDate } from "@/components/admin/ui";
import { Icon, inr } from "@/components/ui";
import { removeEnquiry } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { whatsappLink } from "@/lib/content";
import { getEnquiry } from "@/lib/data/crm";
import { getPackageBySlug } from "@/lib/data/packages";

export const metadata: Metadata = { title: "Enquiry" };

export default async function EnquiryPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const e = getEnquiry(Number(id));
  if (!e) notFound();
  const pkg = e.packageSlug ? getPackageBySlug(e.packageSlug, { includeDrafts: true }) : null;
  const phoneDigits = e.phone.replace(/\D/g, "");
  const firstName = e.name.split(" ")[0];

  const details: [string, string][] = [
    ["Journey", pkg?.title ?? (e.packageSlug === "custom" ? "Custom trip" : "—")],
    ["Travel month", e.travelMonth || "Flexible"],
    ["Travellers", String(e.travellers)],
    ["Estimated value", pkg ? `${inr(pkg.price * e.travellers)} (list price)` : "—"],
    ["Source", e.source],
    ["Received", fmtDate(e.createdAt)],
    ["Last updated", fmtDate(e.updatedAt)],
  ];

  return (
    <>
      <Link href="/admin/enquiries" className="text-sm text-mist hover:text-snow">← Enquiries</Link>
      <div className="mt-3">
        <PageHeader
          title={e.name}
          description={`Enquiry #${e.id}`}
          actions={
            <form action={removeEnquiry}>
              <input type="hidden" name="id" value={e.id} />
              <ConfirmButton message={`Delete the enquiry from ${e.name}?`} className="btn btn-ghost btn-sm !border-[#d03b3b]/40 !text-err">
                Delete
              </ConfirmButton>
            </form>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <Card title="Contact">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={e.status} />
              {e.phone && (
                <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="btn btn-ghost btn-sm">
                  <Icon name="phone" className="size-4" /> {e.phone}
                </a>
              )}
              {phoneDigits.length >= 10 && (
                <a
                  href={whatsappLink(phoneDigits, `Hi ${firstName}, this is Himalayan Escape regarding your ${pkg?.title ?? "Himachal"} enquiry.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <Icon name="whatsapp" className="size-4" /> WhatsApp
                </a>
              )}
              {e.email && (
                <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Your ${pkg?.title ?? "Himachal"} trip`)}`} className="btn btn-ghost btn-sm">
                  <Icon name="mail" className="size-4" /> {e.email}
                </a>
              )}
            </div>
          </Card>

          <Card title="Trip details">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate">{k}</dt>
                  <dd className="mt-0.5 text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            {pkg && (
              <Link href={`/admin/packages/${pkg.id}`} className="mt-4 inline-block text-xs text-mist hover:text-snow">
                View package →
              </Link>
            )}
          </Card>

          <Card title="Message from traveller">
            <p className="text-sm whitespace-pre-wrap text-snow/90">{e.message || <span className="text-slate">No message.</span>}</p>
          </Card>
        </div>

        <Card title="Update lead" className="lg:sticky lg:top-6 lg:self-start">
          <EnquiryEditForm enquiry={e} />
        </Card>
      </div>
    </>
  );
}
