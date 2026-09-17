"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Page-wide motion controller, re-armed on every route change:
 * - `[data-reveal]`   → adds `.is-visible` when scrolled into view (variants in globals.css)
 * - `[data-parallax]` → drifts relative to its parent while scrolling
 * - `[data-count]`    → counts up to its value when revealed
 * - `[data-stagger]`  → assigns increasing `--delay` to its revealed children
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
      const step = Number(group.dataset.stagger) || 80;
      group.querySelectorAll<HTMLElement>(":scope > [data-reveal]").forEach((el, i) => {
        el.style.setProperty("--delay", `${i * step}ms`);
      });
    });

    const countUp = (el: HTMLElement) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? "";
      if (reduced || !Number.isFinite(target)) return;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1600);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = `${Math.round(target * eased).toLocaleString("en-IN")}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-visible");
          if (el.dataset.count) countUp(el);
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => io.observe(el));

    const layers = reduced ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      document.documentElement.style.setProperty(
        "--progress",
        String(Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - vh))),
      );
      for (const el of layers) {
        const box = (el.parentElement ?? el).getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) continue;
        const speed = Number(el.dataset.parallax) || 0.15;
        const offset = (box.top + box.height / 2 - vh / 2) * -speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
