import Link from "next/link";
import { nav, site, whatsappLink } from "@/lib/content";
import type { Settings } from "@/lib/types";
import { Icon, Logo, type IconName } from "../ui";

export function Footer({ settings }: { settings: Settings }) {
  const contact: { icon: IconName; label: string; href: string; external?: boolean }[] = [
    { icon: "phone", label: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { icon: "mail", label: settings.email, href: `mailto:${settings.email}` },
    { icon: "whatsapp", label: "WhatsApp", href: whatsappLink(settings.whatsapp), external: true },
    { icon: "instagram", label: `@${settings.instagram}`, href: `https://instagram.com/${settings.instagram}`, external: true },
  ];

  return (
    <footer className="relative mt-auto border-t border-line bg-night/80 backdrop-blur-xl">
      <div className="absolute inset-x-0 -top-px h-px bg-aurora-hairline opacity-60" />
      <div className="container-x grid gap-8 py-10 sm:py-12 md:grid-cols-[1.3fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-4 font-display text-xl font-medium">
            Find your way to the <span className="accent text-gradient">mountains.</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-mist">{settings.address}</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-xs font-medium tracking-wider text-slate uppercase">Explore</h2>
          <ul className="mt-3 grid grid-cols-3 gap-x-4 gap-y-2 text-sm md:grid-cols-2 md:gap-x-6">
            {nav.slice(1).map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="link-slide inline-block py-1 text-mist hover:text-snow">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-medium tracking-wider text-slate uppercase">Contact</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-1">
            {contact.map((c) => (
              <li key={c.icon} className="min-w-0">
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex max-w-full min-w-0 items-center gap-2.5 text-mist transition-colors hover:text-snow"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line transition-all duration-500 group-hover:border-sky/50 group-hover:bg-sky/10">
                    <Icon name={c.icon} className="size-4" />
                  </span>
                  <span className="truncate">{c.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col justify-between gap-2 border-t border-line py-5 text-xs text-slate sm:flex-row">
        <p>© 2026 {site.name}. All rights reserved.</p>
        <p>Photography via Unsplash</p>
      </div>
    </footer>
  );
}
