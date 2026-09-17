import type { Metadata } from "next";
import Link from "next/link";
import { PackageForm } from "@/components/admin/package-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New package" };

export default async function NewPackagePage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/packages" className="text-sm text-mist hover:text-snow">← Packages</Link>
      <div className="mt-3">
        <PageHeader title="New package" description="Saved as a draft until you publish it." />
      </div>
      <PackageForm />
    </>
  );
}
