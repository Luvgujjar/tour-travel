import type { MetadataRoute } from "next";
import { nav, site } from "@/lib/content";
import { listPackages } from "@/lib/data/packages";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...nav.map((n) => ({ url: `${site.url}${n.href === "/" ? "" : n.href}`, changeFrequency: "weekly" as const })),
    ...listPackages().map((p) => ({ url: `${site.url}/packages/${p.slug}`, lastModified: p.updatedAt.replace(" ", "T") + "Z" })),
  ];
}
