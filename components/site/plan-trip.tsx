"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EnquiryForm } from "./enquiry-form";

/**
 * Global trip-planning dialog. Any link to `#plan` opens it, so CTAs across
 * server-rendered pages stay plain anchors. On a package page the package is preselected.
 */
export function PlanTrip({ packages, whatsapp }: { packages: { slug: string; title: string }[]; whatsapp: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [key, setKey] = useState(0);

  const current = pathname.startsWith("/packages/") ? pathname.split("/")[2] : "";

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const open = () => {
      setKey((k) => k + 1);
      d.showModal();
    };
    const sync = () => {
      if (location.hash === "#plan" && !d.open) open();
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest('a[href="#plan"]');
      if (!a) return;
      e.preventDefault();
      open();
    };
    sync();
    window.addEventListener("hashchange", sync);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", sync);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const close = () => {
    dialog.current?.close();
    if (location.hash === "#plan") history.replaceState(null, "", location.pathname + location.search);
  };

  return (
    <dialog
      id="plan"
      ref={dialog}
      aria-labelledby="plan-title"
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="sheet m-auto w-[min(36rem,calc(100%-1.5rem))] overflow-hidden rounded-3xl border border-line bg-night-2 p-0 text-snow shadow-2xl backdrop:bg-night/70 backdrop:backdrop-blur-md open:animate-[rise-in_0.6s_var(--ease-smooth)]"
    >
      <div className="h-1 bg-aurora-90" />
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 rounded-full bg-snow/20 sm:hidden" />
      <div className="max-h-[85dvh] overflow-y-auto overscroll-contain p-5 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Plan my trip</p>
            <h2 id="plan-title" className="mt-4 text-3xl font-semibold">
              Tell us about your <span className="accent text-gradient font-normal">journey</span>
            </h2>
            <p className="mt-2 text-sm text-mist">A trip planner replies within a few hours with a tailored quote.</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 hover:rotate-90 hover:border-line-strong"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
              <path d="m3 3 10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <EnquiryForm key={key} packages={packages} whatsapp={whatsapp} source="plan-dialog" defaultPackage={current} compact onDone={close} />
      </div>
    </dialog>
  );
}
