import Image from "next/image";
import Link from "next/link";
import type { TourPackage } from "@/lib/types";
import { Arrow, Icon, inr } from "../ui";
import { Tilt } from "./tilt";

export function PackageCard({ pkg, priority = false }: { pkg: TourPackage; priority?: boolean }) {
  return (
    <Tilt className="h-full rounded-3xl">
      <article className="glow-card group flex h-full flex-row overflow-hidden sm:flex-col">
        <Link href={`/packages/${pkg.slug}`} className="absolute inset-0 z-[4]" aria-label={`View ${pkg.title}`} data-track="View Package" />
        <div className="img-zoom relative w-[36%] shrink-0 overflow-hidden sm:aspect-[16/10] sm:w-auto">
          <Image
            src={pkg.image}
            alt=""
            fill
            preload={priority}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-night-2 via-night-2/10 to-transparent" />
          <div className="absolute top-3 left-3 hidden gap-1.5 sm:flex">
            <span className="glass rounded-full px-2.5 py-1 text-[0.7rem] font-medium">
              {pkg.days}D / {pkg.nights}N
            </span>
            <span className="glass rounded-full px-2.5 py-1 text-[0.7rem] font-medium">{pkg.difficulty}</span>
          </div>
          {pkg.featured && (
            <span className="absolute top-3 right-3 hidden items-center gap-1 rounded-full sm:inline-flex bg-aurora-warm px-2.5 py-1 text-[0.7rem] font-semibold text-on-accent">
              <Icon name="sparkle" className="size-3" /> Featured
            </span>
          )}
        </div>

        <div className="tilt-pop flex min-w-0 flex-1 flex-col p-3.5 sm:p-5">
          <p className="flex items-center gap-1.5 truncate text-xs text-glacier">
            <Icon name="route" className="size-3.5" />
            {pkg.route.join(" · ")}
          </p>
          <h3 className="mt-1 text-base leading-tight font-semibold sm:mt-2 sm:text-xl">{pkg.title}</h3>
          <p className="mt-0.5 text-xs text-slate sm:hidden">{pkg.days}D / {pkg.nights}N · {pkg.difficulty}</p>
          <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-mist max-sm:hidden">{pkg.summary}</p>
          <div className="mt-auto flex items-end justify-between pt-2 sm:mt-4 sm:border-t sm:border-line sm:pt-4">
            <p>
              <span className="block text-[0.7rem] text-slate">From</span>
              <span className="font-display text-lg font-semibold sm:text-xl">{inr(pkg.price)}</span>
              <span className="text-xs text-slate"> /person</span>
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium transition-all duration-500 group-hover:border-transparent group-hover:bg-snow group-hover:text-night">
              View <Arrow className="size-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Tilt>
  );
}
