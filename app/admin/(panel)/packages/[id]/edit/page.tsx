import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageForm } from "@/components/admin/package-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getPackageById } from "@/lib/data/packages";

export const metadata: Metadata = { title: "Edit package" };

export default async function EditPackagePage({ params }: PageProps<"/admin/packages/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  const pkg = getPackageById(Number(id));
  if (!pkg) notFound();
  return (
    <>
      <Link href={`/admin/packages/${pkg.id}`} className="text-sm text-mist hover:text-snow">← {pkg.title}</Link>
      <div className="mt-3">
        <PageHeader title={`Edit: ${pkg.title}`} description={`Last updated ${pkg.updatedAt} UTC`} />
      </div>
      <PackageForm pkg={pkg} />
    </>
  );
}
