import type { Metadata } from "next";
import Link from "next/link";
import { NewEnquiryForm } from "@/components/admin/enquiry-forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { listPackages } from "@/lib/data/packages";

export const metadata: Metadata = { title: "Add lead" };

export default async function NewEnquiryPage() {
  await requireAdmin();
  const packages = listPackages({ includeDrafts: true }).map((p) => ({ slug: p.slug, title: p.title }));
  return (
    <>
      <Link href="/admin/enquiries" className="text-sm text-mist hover:text-snow">← Enquiries</Link>
      <div className="mt-3">
        <PageHeader title="Add a lead" description="Log enquiries that came in by phone, WhatsApp or in person." />
      </div>
      <Card className="max-w-2xl">
        <NewEnquiryForm packages={packages} />
      </Card>
    </>
  );
}
