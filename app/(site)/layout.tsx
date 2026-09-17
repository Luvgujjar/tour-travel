import { ViewTransition } from "react";
import { ActionBar } from "@/components/site/action-bar";
import { Background3D } from "@/components/site/background-3d";
import { Footer } from "@/components/site/footer";
import { Motion } from "@/components/site/motion";
import { Nav } from "@/components/site/nav";
import { PlanTrip } from "@/components/site/plan-trip";
import { Tracker } from "@/components/site/tracker";
import { getSettings } from "@/lib/data/crm";
import { listPackages } from "@/lib/data/packages";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = getSettings();
  const packages = listPackages().map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <div className="flex min-h-dvh flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-snow px-4 py-2 text-night focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Background3D />
      <Nav announcement={settings.announcement} />
      <ViewTransition>
        <main id="main" className="flex-1">
          {children}
        </main>
      </ViewTransition>
      <Footer settings={settings} />
      <ActionBar phone={settings.phone} whatsapp={settings.whatsapp} />
      <PlanTrip packages={packages} whatsapp={settings.whatsapp} />
      <Motion />
      <Tracker />
    </div>
  );
}
