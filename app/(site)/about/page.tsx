import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/page-hero";
import { Tilt } from "@/components/site/tilt";
import { Icon, SectionHeading, type IconName } from "@/components/ui";
import { benefits, img, storyMoments } from "@/lib/content";
import { listTestimonials } from "@/lib/data/crm";
import { listPackages } from "@/lib/data/packages";

export const metadata: Metadata = {
  title: "About Us",
  description: "Himalayan Escape plans unhurried, well-looked-after Himachal journeys with local experts and small groups.",
};

const benefitIcons: IconName[] = ["route", "compass", "shield", "users", "support"];

export default function AboutPage() {
  const testimonials = listTestimonials().slice(0, 3);
  const packageCount = listPackages().length;

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Not just a trip. A story"
        accent="you'll tell forever."
        image={{ src: img("1506905925346-21bda4d32df4"), alt: "Snow peaks at sunrise above a sea of clouds" }}
      />

      {/* Story */}
      <section aria-labelledby="story-title" className="pb-16">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <ul className="rail grid grid-cols-2 gap-3" data-stagger="100">
            {storyMoments.map((m, i) => (
              <li key={m.title} data-reveal="image" className={`dark-scope group relative aspect-[4/5] overflow-hidden rounded-3xl max-sm:!basis-[62%] ${i % 2 ? "sm:mt-8" : ""}`}>
                <div data-parallax={i % 2 ? "0.06" : "0.02"} className="absolute -inset-y-[8%] inset-x-0">
                  <Image src={m.src} alt={m.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-night/80 to-transparent" />
                <p className="absolute bottom-3 left-3 right-3 text-sm font-medium">{m.title}</p>
              </li>
            ))}
          </ul>
          <div data-reveal="left">
            <p className="eyebrow">Our story</p>
            <h2 id="story-title" className="mt-5 text-3xl leading-tight font-semibold sm:text-5xl">
              Made in the mountains, <span className="accent text-gradient font-normal">by mountain people.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-mist">
              Himalayan Escape was built by travellers who grew up on these roads. We plan the kind of journeys we&apos;d want for
              our own families — unhurried, well-looked-after and full of the places guidebooks miss.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-3">
              {[
                { v: packageCount, s: "", l: "Signature journeys" },
                { v: 5, s: "", l: "Regions covered" },
                { v: 12, s: "", l: "Max group size" },
              ].map((x) => (
                <div key={x.l} className="glass flex flex-col-reverse rounded-2xl p-4">
                  <dt className="mt-1 text-xs text-mist">{x.l}</dt>
                  <dd className="font-display text-3xl font-semibold text-gradient" data-count={x.v} data-suffix={x.s}>
                    {x.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section aria-labelledby="why-title" className="pb-16">
        <div className="container-x">
          <SectionHeading id="why-title" eyebrow="Why travel with us" title="Five promises on" accent="every road" />
          <ul className="rail scroll-3d mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" data-stagger="80">
            {benefits.map((b, i) => (
              <li key={b.title} data-reveal="up">
                <Tilt max={8} className="h-full rounded-3xl">
                  <div className="glow-card group h-full p-5">
                    <span className="tilt-pop grid size-11 place-items-center rounded-2xl border border-line bg-snow/[0.04] text-glacier transition-all duration-500 group-hover:rotate-6 group-hover:bg-aurora-2 group-hover:text-on-accent">
                      <Icon name={benefitIcons[i]} />
                    </span>
                    <h3 className="mt-4 font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm text-mist">{b.text}</p>
                  </div>
                </Tilt>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section aria-labelledby="stories-title" className="pb-20">
          <div className="container-x">
            <SectionHeading id="stories-title" eyebrow="Traveller stories" title="Stories from" accent="the road" />
            <ul className="rail scroll-3d mt-8 grid gap-4 md:grid-cols-3" data-stagger="120">
              {testimonials.map((t) => (
                <li key={t.id} data-reveal="blur">
                  <figure className="glow-card flex h-full flex-col p-6">
                    <span aria-hidden="true" className="accent text-gradient text-6xl leading-none">
                      &ldquo;
                    </span>
                    <blockquote className="-mt-4 flex-1 leading-relaxed text-snow/90">{t.quote}</blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                      <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-aurora-13 font-semibold text-on-accent">
                        {t.name.charAt(0)}
                      </span>
                      <span className="text-sm">
                        <span className="block font-medium">{t.name}</span>
                        <span className="block text-slate">
                          {t.location}
                          {t.trip ? ` · ${t.trip}` : ""}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
