import type { Metadata } from "next";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { PageHero } from "@/components/site/page-hero";
import { Icon, type IconName } from "@/components/ui";
import { faqs, img, whatsappLink } from "@/lib/content";
import { getSettings } from "@/lib/data/crm";
import { listPackages } from "@/lib/data/packages";

export const metadata: Metadata = {
  title: "Contact",
  description: "Plan your Himachal trip — call, WhatsApp or send an enquiry and a trip planner will reply within hours.",
};

export default function ContactPage() {
  const settings = getSettings();
  const packages = listPackages().map((p) => ({ slug: p.slug, title: p.title }));

  const channels: { icon: IconName; label: string; value: string; href: string; external?: boolean }[] = [
    { icon: "whatsapp", label: "WhatsApp", value: "Chat with a planner", href: whatsappLink(settings.whatsapp), external: true },
    { icon: "phone", label: "Call us", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { icon: "mail", label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { icon: "instagram", label: "Instagram", value: `@${settings.instagram}`, href: `https://instagram.com/${settings.instagram}`, external: true },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's plan your"
        accent="escape."
        intro="Tell us where you want to go. A trip planner replies within a few hours with a tailored itinerary and quote."
        image={{ src: img("1597167231350-d057a45dc868"), alt: "Mist over a mountain town beneath snowy peaks" }}
      />

      <section aria-label="Contact options" className="pb-20">
        <div className="container-x grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div data-reveal="up" className="glow-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Send an enquiry</h2>
            <p className="mt-1 mb-6 text-sm text-mist">No payment needed — we&apos;ll send options first.</p>
            <EnquiryForm packages={packages} whatsapp={settings.whatsapp} source="contact" />
          </div>

          <div className="flex flex-col gap-6">
            <ul className="grid grid-cols-2 gap-3" data-stagger="80">
              {channels.map((c) => (
                <li key={c.label} data-reveal="zoom">
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="glow-card group flex h-full flex-col gap-3 p-4 hover:-translate-y-1"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-snow/[0.05] text-glacier transition-all duration-500 group-hover:scale-110 group-hover:bg-aurora-2 group-hover:text-on-accent">
                      <Icon name={c.icon} />
                    </span>
                    <span>
                      <span className="block text-xs text-slate">{c.label}</span>
                      <span className="block truncate text-sm font-medium">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div data-reveal="up" className="glass rounded-3xl p-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <Icon name="pin" className="size-4 text-glacier" /> Visit us
              </h2>
              <p className="mt-1 text-sm text-mist">{settings.address}</p>
            </div>

            <div data-reveal="up" className="glass rounded-3xl p-2">
              <h2 className="px-3 pt-3 pb-1 font-semibold">Quick answers</h2>
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-2xl px-3 open:bg-snow/[0.03]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden="true" className="text-mist transition-transform duration-500 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-3 text-sm text-mist">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
