"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const VISITOR_KEY = "he_vid";

function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

function beacon(payload: Record<string, string>) {
  const body = JSON.stringify({ ...payload, visitor: visitorId() });
  const blob = new Blob([body], { type: "application/json" });
  if (!navigator.sendBeacon || !navigator.sendBeacon("/api/track", blob)) {
    fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
  }
}

/** Cookie-free first-party analytics: page views and clicks on links/buttons. */
export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    beacon({ type: "view", path: pathname, referrer: document.referrer.startsWith(location.origin) ? "" : document.referrer });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track], a, button");
      if (!el) return;
      const label =
        el.dataset.track ||
        el.getAttribute("aria-label") ||
        el.textContent?.replace(/\s+/g, " ").trim() ||
        el.getAttribute("href") ||
        "";
      if (!label) return;
      beacon({ type: "click", path: location.pathname, label: label.slice(0, 80) });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
