"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/content";
import { Icon } from "../ui";

/** Phone-only sticky actions: call, WhatsApp and plan a trip. Tucks away while scrolling down. */
export function ActionBar({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
        if (Math.abs(y - last) > 8) setHidden(y > last && y > 240 && !nearBottom);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[0.68rem] font-medium text-mist active:scale-95 transition-transform";

  return (
    <nav
      aria-label="Quick actions"
      className={`action-bar fixed inset-x-3 z-40 transition-transform duration-500 ease-[var(--ease-smooth)] md:hidden ${hidden ? "translate-y-[140%]" : ""}`}
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-1 rounded-2xl border border-line bg-night-2/90 p-1.5 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.5)] backdrop-blur-xl">
        <a href={`tel:${phone.replace(/\s/g, "")}`} className={item} data-track="Call (mobile bar)">
          <Icon name="phone" className="size-5 text-snow" />
          Call
        </a>
        <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer" className={item} data-track="WhatsApp (mobile bar)">
          <Icon name="whatsapp" className="size-5 text-snow" />
          WhatsApp
        </a>
        <a href="#plan" className="btn btn-primary !min-h-12 flex-[1.6] !rounded-xl !px-3 text-sm" data-track="Plan My Trip (mobile bar)">
          Plan my trip
        </a>
      </div>
    </nav>
  );
}
