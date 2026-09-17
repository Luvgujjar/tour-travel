import Image from "next/image";
import type { ReactNode } from "react";
import { SplitWords } from "../ui";

/** Compact header used by every inner page — keeps pages short while staying cinematic. */
export function PageHero({
  eyebrow,
  title,
  accent,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: string;
  image?: { src: string; alt: string };
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-16">
      {image && (
        <div className="absolute inset-0 -z-10">
          <div data-parallax="0.2" className="kenburns absolute -inset-y-[20%] inset-x-0">
            <Image src={image.src} alt={image.alt} fill preload sizes="100vw" className="object-cover opacity-35" />
          </div>
          <div className="absolute inset-0 fade-page-hero" />
          <div className="absolute inset-0 glow-corner" />
        </div>
      )}
      <div className="container-x">
        <div className="max-w-3xl split-now">
          <p className="eyebrow rise">{eyebrow}</p>
          <h1 className="mt-5 text-4xl leading-[1.04] font-semibold text-balance sm:text-6xl lg:text-7xl">
            <SplitWords text={title} />
            {accent ? (
              <>
                {" "}
                <span className="accent text-gradient rise pr-1 font-normal" style={{ animationDelay: "400ms" }}>
                  {accent}
                </span>
              </>
            ) : null}
          </h1>
          {intro && (
            <p className="rise mt-5 max-w-xl text-base text-mist sm:text-lg" style={{ animationDelay: "300ms" }}>
              {intro}
            </p>
          )}
        </div>
        {children && (
          <div className="rise mt-8" style={{ animationDelay: "450ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
