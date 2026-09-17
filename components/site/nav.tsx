"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/content";
import { ThemeToggle } from "../theme-toggle";
import { Logo } from "../ui";

export function Nav({ announcement }: { announcement?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu when the route changes (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="rise fixed inset-0 -z-10 bg-night/60 backdrop-blur-sm lg:hidden"
          style={{ animationDuration: "0.4s" }}
        />
      )}
      {/* Scroll progress */}
      <div aria-hidden="true" className="scroll-progress absolute inset-x-0 top-0 z-10 h-[2px] bg-aurora-90" />

      {announcement && !scrolled && (
        <div className="hidden border-b border-line bg-night/40 py-2 text-center text-xs text-mist backdrop-blur md:block">
          <span className="mr-2 inline-block size-1.5 rounded-full bg-glacier align-middle pulse-ring" />
          {announcement}{" "}
          <Link href="/packages" className="link-slide ml-1 text-snow">
            View journeys →
          </Link>
        </div>
      )}

      <div className="container-x pt-3">
        <div
          className={`flex items-center justify-between gap-4 rounded-2xl px-3 py-2 transition-all duration-700 ease-[var(--ease-smooth)] sm:px-4 ${
            scrolled || open ? "border border-line bg-night-2/85 backdrop-blur-xl shadow-[0_20px_50px_-24px_rgb(0_0_0/0.4)]" : "border border-transparent"
          }`}
        >
          <Link href="/" aria-label="Himalayan Escape — home" className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full border border-line bg-snow/[0.03] p-1">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative block rounded-full px-4 py-1.5 text-sm transition-all duration-500 ${
                        active ? "bg-snow/10 text-snow shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]" : "text-mist hover:bg-snow/5 hover:text-snow"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden md:block">
              <ThemeToggle />
            </span>
            <a href="#plan" className="btn btn-primary btn-sm hidden sm:inline-flex" data-track="Book Your Trip">
              Book Your Trip
            </a>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-xl border border-line bg-snow/[0.04] lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 h-[1.5px] w-4 rounded bg-snow transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[1.5px] w-4 rounded bg-snow transition-all duration-500 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>

        <div id="mobile-menu" hidden={!open} className="mt-2 rounded-2xl border border-line bg-night-2/95 p-3 shadow-xl backdrop-blur-xl lg:hidden">
          <nav aria-label="Mobile">
            <ul>
              {nav.map((item, i) => (
                <li key={item.href} className="rise" style={{ animationDelay: `${i * 45}ms` }}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-lg active:scale-[0.98] transition-transform ${
                      isActive(item.href) ? "bg-snow/10" : "hover:bg-snow/5"
                    }`}
                  >
                    {item.label}
                    <span className="text-slate">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 md:hidden">
              <ThemeToggle full className="w-full" />
            </div>
            <a href="#plan" onClick={() => setOpen(false)} className="btn btn-primary mt-3 w-full">
              Book Your Trip
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
