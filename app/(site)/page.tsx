import Image from "next/image";
import Link from "next/link";
import { PackageCard } from "@/components/site/package-card";
import { Tilt } from "@/components/site/tilt";
import { Arrow, Icon, SectionHeading, SplitWords, delay } from "@/components/ui";
import { destinations, site, whatsappLink } from "@/lib/content";
import { getSettings } from "@/lib/data/crm";
import { featuredPackages, listPackages } from "@/lib/data/packages";

export default function Home() {
  const featured = featuredPackages(3);
  const total = listPackages().length;
  const settings = getSettings();

  const stats = [
    { value: total, suffix: "", label: "Curated journeys" },
    { value: destinations.length, suffix: "", label: "Himalayan regions" },
    { value: 24, suffix: "/7", label: "On-trip support" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: site.name,
    slogan: site.tagline,
    url: site.url,
    telephone: settings.phone,
    email: settings.email,
    areaServed: "Himachal Pradesh, India",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ---------------- Hero ---------------- */}
      <section aria-labelledby="hero-title" className="relative flex min-h-svh items-center overflow-x-clip pt-28 pb-16">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="split-now relative">
            <div aria-hidden="true" className="absolute -inset-x-24 -inset-y-16 -z-10 scrim-hero" />
            <p className="eyebrow rise">Explore Himachal</p>
            <h1 id="hero-title" className="mt-6 text-[clamp(2.6rem,6.6vw,5.6rem)] leading-[1.02] font-semibold text-balance">
              <SplitWords text="Where every road leads to the" />{" "}
              <span className="accent text-gradient rise pr-2 font-normal" style={{ animationDelay: "500ms" }}>
                mountains
              </span>
            </h1>
            <p className="rise mt-6 max-w-lg text-lg leading-relaxed text-mist" style={{ animationDelay: "350ms" }}>
              Curated Himachal journeys designed for travelers who want more than a holiday.
            </p>
            <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "500ms" }}>
              <Link href="/packages" className="btn btn-primary">
                Explore Packages <Arrow />
              </Link>
              <a href="#plan" className="btn btn-ghost">
                Plan My Trip
              </a>
            </div>

            <dl data-reveal="up" className="mt-10 grid max-w-lg grid-cols-3 gap-2 sm:mt-12 sm:gap-3">
              {stats.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-3 sm:p-4">
                  <dt className="text-xs text-mist">{s.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                    <span data-count={s.value} data-suffix={s.suffix}>
                      {s.value}
                      {s.suffix}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Floating stack of destination cards */}
          <div className="relative hidden h-[34rem] lg:block" aria-hidden="true">
            {destinations.slice(0, 3).map((d, i) => (
              <div
                key={d.name}
                className="rise absolute"
                style={{
                  animationDelay: `${600 + i * 180}ms`,
                  top: ["2%", "30%", "56%"][i],
                  left: ["30%", "0%", "38%"][i],
                  zIndex: 3 - i,
                }}
              >
                <div className="float" style={{ animationDelay: `${i * -2}s` }}>
                  <Tilt max={10} className="rounded-3xl">
                    <div className="glow-card overflow-hidden p-2" style={{ width: ["17rem", "15rem", "14rem"][i] }}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                        <Image src={d.src} alt="" fill preload={i === 0} sizes="18rem" className="object-cover" />
                      </div>
                      <div className="tilt-pop flex items-center justify-between px-2 pt-3 pb-1">
                        <span>
                          <span className="block text-sm font-semibold">{d.name}</span>
                          <span className="block text-xs text-mist">{d.region}</span>
                        </span>
                        <span className="rounded-full bg-snow/10 px-2 py-0.5 text-[0.65rem] text-glacier">{d.altitude}</span>
                      </div>
                    </div>
                  </Tilt>
                </div>
              </div>
            ))}
          </div>
        </div>

        <a
          href="#featured"
          className="rise absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-mist hover:text-snow sm:flex"
          style={{ animationDelay: "1200ms" }}
        >
          <span className="flex h-8 w-5 justify-center rounded-full border border-line-strong pt-1.5">
            <span className="scroll-dot block size-1 rounded-full bg-snow" />
          </span>
          Scroll to explore
        </a>
      </section>

      {/* ---------------- Destination marquee ---------------- */}
      <section aria-label="Destinations" className="marquee-wrap relative overflow-hidden border-y border-line bg-night/40 py-4 backdrop-blur-sm sm:py-5">
        <div className="marquee gap-4 pr-4">
          {[...destinations, ...destinations].map((d, i) => (
            <Link
              key={`${d.name}-${i}`}
              href={`/packages?destination=${encodeURIComponent(d.slug)}`}
              tabIndex={i >= destinations.length ? -1 : undefined}
              aria-hidden={i >= destinations.length ? true : undefined}
              className="group flex shrink-0 items-center gap-3 rounded-full border border-line bg-snow/[0.03] py-1.5 pr-5 pl-1.5 transition-all duration-500 hover:border-sky/40 hover:bg-snow/[0.07]"
            >
              <span className="relative size-10 overflow-hidden rounded-full">
                <Image src={d.src} alt="" fill sizes="40px" className="object-cover transition-transform duration-700 group-hover:scale-125" />
              </span>
              <span className="font-display text-lg font-medium whitespace-nowrap">{d.name}</span>
              <span className="text-xs text-slate">{d.altitude}</span>
            </Link>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-night to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-night to-transparent" />
      </section>

      {/* ---------------- Featured journeys ---------------- */}
      <section id="featured" aria-labelledby="featured-title" className="py-14 sm:py-24">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading id="featured-title" eyebrow="Featured journeys" title="The mountains are" accent="calling" />
            <Link data-reveal="left" href="/packages" className="btn btn-ghost self-start md:self-end">
              All {total} packages <Arrow />
            </Link>
          </div>
          <p className="swipe-hint mt-6 text-xs text-slate sm:hidden" aria-hidden="true">Swipe to explore →</p>
          <ul className="rail scroll-3d mt-3 grid gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3" data-stagger="120">
            {featured.map((p) => (
              <li key={p.id} data-reveal="tilt">
                <PackageCard pkg={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section aria-labelledby="cta-title" className="pb-14 sm:pb-20">
        <div className="container-x">
          <div data-reveal="zoom" className="border-spin relative overflow-hidden rounded-[2rem] p-6 sm:p-14">
            <div className="absolute inset-0 -z-10 bg-aurora-soft" />
            <div className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-violet/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 -z-10 size-72 rounded-full bg-glacier/20 blur-3xl" />
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <h2 id="cta-title" className="text-3xl font-semibold text-balance sm:text-5xl">
                  Your Himalayan Escape <span className="accent text-gradient font-normal">starts here.</span>
                </h2>
                <p className="mt-4 text-lg text-mist">Tell us where you want to go. We&apos;ll help you build the perfect journey.</p>
              </div>
              <div style={delay(200)} className="flex flex-col gap-3 sm:flex-row">
                <a href="#plan" className="btn btn-primary">
                  Plan My Trip <Arrow />
                </a>
                <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <Icon name="whatsapp" className="size-4" /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
