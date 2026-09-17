import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { Tilt } from "@/components/site/tilt";
import { Arrow } from "@/components/ui";
import { destinations, img } from "@/lib/content";
import { listPackages } from "@/lib/data/packages";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Manali, Kasol, Spiti Valley, Shimla and Dharamshala — explore the five corners of Himachal Pradesh.",
};

// Bento layout: one hero tile, then a mix of tall and wide.
const spans = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-4",
];

export default function DestinationsPage() {
  const packages = listPackages();
  const count = (slug: string) => packages.filter((p) => p.route.includes(slug)).length;

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Five valleys, five"
        accent="different worlds"
        intro="Each corner of Himachal has its own light, altitude and pace. Pick one — or let us string them together."
        image={{ src: img("1712388430474-ace0c16051e2"), alt: "Sunlit snow peaks above a glacial river" }}
      />

      <section aria-label="All destinations" className="pb-20">
        <ul className="scroll-3d container-x grid auto-rows-[15rem] gap-4 sm:gap-5 md:grid-cols-4 md:auto-rows-[16rem]" data-stagger="90">
          {destinations.map((d, i) => {
            const n = count(d.slug);
            return (
              <li key={d.name} data-reveal="zoom" className={spans[i]}>
                <Tilt max={4} className="h-full rounded-3xl">
                  <Link
                    href={`/packages?destination=${encodeURIComponent(d.slug)}`}
                    className="dark-scope glow-card group relative flex h-full flex-col justify-end overflow-hidden p-5 sm:p-6"
                  >
                    <div className="img-zoom kenburns absolute inset-0 -z-10 overflow-hidden">
                      <Image
                        src={d.src}
                        alt={d.alt}
                        fill
                        preload={i === 0}
                        sizes={i === 4 ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 -z-10 bg-linear-to-t from-night via-night/30 to-transparent transition-opacity duration-700 group-hover:opacity-80" />
                    <div className="absolute top-4 left-4 flex gap-2 sm:top-5 sm:left-5">
                      <span className="glass rounded-full px-2.5 py-1 text-xs">{d.region}</span>
                      <span className="glass rounded-full px-2.5 py-1 text-xs text-glacier">{d.altitude}</span>
                    </div>
                    <div className="tilt-pop">
                      <h2 className={`font-semibold ${i === 0 ? "text-4xl sm:text-6xl" : "text-3xl"}`}>{d.name}</h2>
                      <p className={`mt-1 text-sm text-snow/80 ${i === 0 ? "max-w-sm sm:text-base" : "line-clamp-1"}`}>{d.line}</p>
                      <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium">
                        <span className="rounded-full bg-snow/15 px-2.5 py-0.5 text-xs backdrop-blur">
                          {n} {n === 1 ? "journey" : "journeys"}
                        </span>
                        <span className="inline-flex items-center gap-1 opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100">
                          Explore <Arrow className="size-3.5" />
                        </span>
                      </p>
                    </div>
                  </Link>
                </Tilt>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
