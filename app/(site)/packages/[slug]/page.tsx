import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageTabs } from "@/components/site/package-tabs";
import { Arrow, Icon, SplitWords, inr, type IconName } from "@/components/ui";
import { whatsappLink } from "@/lib/content";
import { getSettings } from "@/lib/data/crm";
import { getPackageBySlug, listPackages, relatedPackages } from "@/lib/data/packages";

export function generateStaticParams() {
  return listPackages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/packages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) return { title: "Package not found" };
  return {
    title: `${pkg.title} — ${pkg.days}D/${pkg.nights}N Himachal Tour`,
    description: pkg.summary,
    openGraph: { images: [{ url: `${pkg.image}?w=1200&h=630&fit=crop`, width: 1200, height: 630 }] },
  };
}

export default async function PackagePage({ params }: PageProps<"/packages/[slug]">) {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) notFound();
  const settings = getSettings();
  const related = relatedPackages(pkg, 3);

  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: "clock", label: "Duration", value: `${pkg.days} days / ${pkg.nights} nights` },
    { icon: "mountain", label: "Difficulty", value: pkg.difficulty },
    { icon: "calendar", label: "Best season", value: pkg.season },
    { icon: "users", label: "Group size", value: pkg.groupSize },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.summary,
    image: pkg.image,
    itinerary: pkg.route.map((r) => ({ "@type": "Place", name: r })),
    offers: { "@type": "Offer", price: pkg.price, priceCurrency: "INR" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="relative isolate flex min-h-[62svh] items-end overflow-hidden pt-32 pb-10">
        <div className="absolute inset-0 -z-10">
          <div data-parallax="0.18" className="kenburns absolute -inset-y-[15%] inset-x-0">
            <Image src={pkg.image} alt="" fill preload sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 fade-package-hero" />
        </div>
        <div className="container-x split-now">
          <nav aria-label="Breadcrumb" className="rise text-sm text-mist">
            <Link href="/packages" className="link-slide hover:text-snow">
              Packages
            </Link>{" "}
            / <span className="text-snow">{pkg.title}</span>
          </nav>
          <h1 className="mt-4 max-w-4xl text-4xl leading-[1.04] font-semibold sm:text-6xl lg:text-7xl">
            <SplitWords text={pkg.title} />
          </h1>
          <p className="rise mt-3 text-lg text-snow/85" style={{ animationDelay: "250ms" }}>
            {pkg.tagline}
          </p>
          <p className="rise mt-5 flex flex-wrap items-center gap-2" style={{ animationDelay: "350ms" }}>
            {pkg.route.map((r, i) => (
              <span key={r} className="flex items-center gap-2">
                <span className="glass rounded-full px-3 py-1 text-sm">{r}</span>
                {i < pkg.route.length - 1 && <span className="h-px w-5 bg-aurora-13" />}
              </span>
            ))}
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div data-reveal="up">
            <PackageTabs pkg={pkg} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" data-reveal="right">
            <div className="border-spin rounded-3xl">
            <div className="glow-card p-6">
              <p className="text-sm text-mist">Starting from</p>
              <p className="mt-1 font-display text-4xl font-semibold">
                <span className="text-gradient">{inr(pkg.price)}</span>
                <span className="text-sm font-normal text-slate"> / person</span>
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                {facts.map((f) => (
                  <div key={f.label} className="rounded-xl border border-line bg-snow/[0.02] p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-slate">
                      <Icon name={f.icon} className="size-3.5" />
                      {f.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <a href="#plan" className="btn btn-primary mt-5 w-full" data-track={`Book: ${pkg.title}`}>
                Book this journey <Arrow />
              </a>
              <a
                href={whatsappLink(settings.whatsapp, `Hi! I'm interested in the ${pkg.title} package.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost mt-2 w-full"
              >
                <Icon name="whatsapp" className="size-4" /> Ask on WhatsApp
              </a>
              <p className="mt-4 flex items-center gap-2 text-xs text-slate">
                <Icon name="shield" className="size-4 text-glacier" /> No payment needed to enquire — get a tailored quote first
              </p>
            </div>
            </div>

            {related.length > 0 && (
              <div className="mt-5">
                <h2 className="text-sm font-medium text-mist">You may also like</h2>
                <ul className="mt-3 space-y-2">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/packages/${r.slug}`}
                        className="group flex items-center gap-3 rounded-2xl border border-line p-2 transition-all duration-500 hover:border-line-strong hover:bg-snow/[0.04]"
                      >
                        <span className="img-zoom relative size-14 shrink-0 overflow-hidden rounded-xl">
                          <Image src={r.image} alt="" fill sizes="56px" className="object-cover" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{r.title}</span>
                          <span className="block text-xs text-slate">
                            {r.days}D · from {inr(r.price)}
                          </span>
                        </span>
                        <Arrow className="mr-2 size-3.5 text-slate transition-transform duration-500 group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
