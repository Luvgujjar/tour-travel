"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { logout } from "@/lib/actions/admin";
import { ThemeToggle } from "../theme-toggle";
import { Logo } from "../ui";

/** Submit button that asks for confirmation first (for destructive actions). */
export function ConfirmButton({ children, message, className = "", title }: { children: ReactNode; message: string; className?: string; title?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      title={title}
      aria-label={title}
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}

export function SubmitButton({ children, className = "btn btn-primary", pendingText = "Saving…" }: { children: ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending ? pendingText : children}
    </button>
  );
}

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "M4 6h16M4 12h16M4 18h10", badge: true },
  { href: "/admin/packages", label: "Packages", icon: "M3 19 9 8l3.5 5.5L15 10l6 9H3Z" },
  { href: "/admin/analytics", label: "Analytics", icon: "M4 19V9m6 10V5m6 14v-7m4 7H3" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "M5 5h14v10H9l-4 4V5Z" },
  { href: "/admin/settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.2-1.3L14.5 3h-4l-.3 2.4a7.5 7.5 0 0 0-2.2 1.3l-2.3-.9-2 3.4 2 1.5a7.4 7.4 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 2.2 1.3l.3 2.4h4l.3-2.4a7.5 7.5 0 0 0 2.2-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z" },
];

export function Sidebar({ newCount, user }: { newCount: number; user: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const links = (
    <ul className="space-y-1">
      {LINKS.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            onClick={() => setOpen(false)}
            aria-current={active(l.href) ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-300 ${
              active(l.href) ? "bg-snow/10 text-snow shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]" : "text-mist hover:bg-snow/5 hover:text-snow"
            }`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={l.icon} />
            </svg>
            <span className="flex-1">{l.label}</span>
            {l.badge && newCount > 0 && (
              <span className="rounded-full bg-series-1 px-1.5 py-0.5 text-[0.65rem] font-semibold text-white" aria-label={`${newCount} new`}>
                {newCount}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  const footer = (
    <div className="space-y-1 border-t border-line pt-3">
      <ThemeToggle full className="mb-2 w-full" />
      <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-mist hover:bg-snow/5 hover:text-snow">
        <span aria-hidden="true">↗</span> View website
      </Link>
      <form action={logout}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-mist hover:bg-snow/5 hover:text-snow">
          <span aria-hidden="true">⎋</span> Log out <span className="ml-auto text-xs text-slate">{user}</span>
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r border-line bg-night-2/80 p-4 backdrop-blur lg:flex">
        <Link href="/admin" className="px-1 pt-1">
          <Logo />
          <span className="mt-2 block text-[0.65rem] tracking-[0.2em] text-slate uppercase">Admin console</span>
        </Link>
        <nav aria-label="Admin" className="flex-1">
          {links}
        </nav>
        {footer}
      </aside>

      {/* Mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-night-2/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin">
          <Logo />
        </Link>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="admin-mobile-nav" className="btn btn-ghost btn-sm">
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <div id="admin-mobile-nav" hidden={!open} className="border-b border-line bg-night-2 p-3 lg:hidden">
        <nav aria-label="Admin mobile">{links}</nav>
        <div className="mt-3">{footer}</div>
      </div>
    </>
  );
}
