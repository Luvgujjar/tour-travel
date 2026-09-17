import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/site/page-hero";
import { PackagesExplorer } from "@/components/site/packages-explorer";
import { img } from "@/lib/content";
import { listPackages } from "@/lib/data/packages";

export const metadata: Metadata = {
  title: "Tour Packages",
  description: "Curated Himachal Pradesh tour packages — Shimla, Manali, Kasol, Spiti, Dharamshala and Kinnaur. Transparent prices, private transport, handpicked stays.",
};

export default function PackagesPage() {
  const packages = listPackages();
  return (
    <>
      <PageHero
        eyebrow="Tour packages"
        title="Journeys, carefully"
        accent="composed"
        intro="Private transport, handpicked stays, daily breakfast & dinner and a local trip lead — on every package."
        image={{ src: img("1648131877984-f39ebc1647f1"), alt: "A road curving through a steep mountain gorge" }}
      />
      <section aria-label="Package list" className="pb-20">
        <Suspense>
          <PackagesExplorer packages={packages} />
        </Suspense>
      </section>
    </>
  );
}
