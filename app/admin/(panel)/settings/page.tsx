import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/controls";
import { SettingsForm } from "@/components/admin/simple-forms";
import { Card, PageHeader } from "@/components/admin/ui";
import { purgeAnalytics, purgeDemoData } from "@/lib/actions/admin";
import { adminCredentials, requireAdmin } from "@/lib/auth";
import { demoDataCounts, getSettings } from "@/lib/data/crm";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const settings = getSettings();
  const demo = demoDataCounts();
  const { insecure } = adminCredentials();

  return (
    <>
      <PageHeader title="Settings" description="Business details used across the website footer, contact page and WhatsApp buttons." />

      <Card title="Business details">
        <SettingsForm settings={settings} />
      </Card>

      <Card title="Account" className="mt-4">
        <p className="text-sm text-mist">
          Signed in as <span className="text-snow">{admin.u}</span>. Credentials are configured with the <code className="rounded bg-snow/10 px-1">ADMIN_USERNAME</code> and{" "}
          <code className="rounded bg-snow/10 px-1">ADMIN_PASSWORD</code> environment variables; sessions last 12 hours.
        </p>
        {insecure && <p className="mt-2 text-sm text-warn">⚠ ADMIN_PASSWORD is not set — using the development default. Set it before deploying.</p>}
      </Card>

      <Card title="Data" className="mt-4">
        <div id="data" className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-line p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">Sample data</p>
              <p className="text-xs text-slate">
                {demo.events.toLocaleString("en-IN")} demo analytics events and {demo.enquiries} demo enquiries were seeded so the dashboard isn&apos;t empty.
              </p>
            </div>
            <form action={purgeDemoData}>
              <ConfirmButton message="Remove all sample analytics and sample enquiries? Real data is kept." className="btn btn-ghost btn-sm" >
                Clear sample data
              </ConfirmButton>
            </form>
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#d03b3b]/30 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-err">Reset analytics</p>
              <p className="text-xs text-slate">Permanently deletes every recorded page view and click. Enquiries are not affected.</p>
            </div>
            <form action={purgeAnalytics}>
              <ConfirmButton message="Delete ALL analytics data? This cannot be undone." className="btn btn-ghost btn-sm !border-[#d03b3b]/40 !text-err">
                Reset analytics
              </ConfirmButton>
            </form>
          </div>
        </div>
      </Card>
    </>
  );
}
