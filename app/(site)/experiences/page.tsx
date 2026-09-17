import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/page-hero";
import { Tilt } from "@/components/site/tilt";
import { Arrow } from "@/components/ui";
import { experiences, img } from "@/lib/content";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Snow adventures, road trips, camping, Himachali food, monasteries, trekking, rafting and village stays.",
};

export default function ExperiencesPage() {
  return (
    <>
      <PageHero
        eyebrow="Experiences"
        title="Experience the"
        accent="Himalayas"
        intro="Add any of these to your journey — or build a whole trip around one."
        image={{ src: img("1662944113366-123561a844e1"), alt: "Tents on an alpine meadow near snow" }}
      />

      <section aria-label="Experience list" className="pb-16">
        <ul className="scroll-3d container-x grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" data-stagger="70">
          {experiences.map((e, i) => (
            <li key={e.title} data-reveal={i % 2 ? "up" : "tilt"}>
              <Tilt max={6} className="rounded-3xl">
                <article className="dark-scope glow-card group relative aspect-[3/4] overflow-hidden">
                  <div className="img-zoom absolute inset-0">
                    <Image src={e.src} alt={e.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-night via-night/40 to-transparent transition-all duration-700 group-hover:via-night/70" />
                  <div className="tilt-pop absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[0.7rem] font-medium text-glacier">{e.note}</p>
                    <h2 className="mt-1 text-lg leading-tight font-semibold sm:text-2xl">{e.title}</h2>
                    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[var(--ease-smooth)] group-hover:grid-rows-[1fr] max-sm:grid-rows-[1fr]">
                      <p className="overflow-hidden text-xs text-snow/80 sm:text-sm">
                        <span className="block pt-2">{e.text}</span>
                      </p>
                    </div>
                  </div>
                </article>
              </Tilt>
            </li>
          ))}
        </ul>

        <div className="container-x mt-10" data-reveal="up">
          <div className="glass flex flex-col items-start justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center">
            <p className="font-display text-xl">
              Want a trip built around <span className="accent text-gradient">one experience?</span>
            </p>
            <a href="#plan" className="btn btn-primary">
              Design my trip <Arrow />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
