import { Sidebar } from "@/components/admin/controls";
import { requireAdmin } from "@/lib/auth";
import { enquiryPipeline } from "@/lib/data/crm";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const newCount = enquiryPipeline().find((p) => p.status === "new")?.n ?? 0;
  return (
    <div className="lg:flex">
      <Sidebar newCount={newCount} user={admin.u} />
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
