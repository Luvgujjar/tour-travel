import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Sora } from "next/font/google";
import { heroImage, site } from "@/lib/content";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Himalayan Escape — Curated Himachal Pradesh Tour Packages",
    template: "%s · Himalayan Escape",
  },
  description:
    "Curated Himachal Pradesh tour packages to Manali, Kasol, Spiti Valley, Shimla and Dharamshala. Small groups, local experts and journeys designed for travellers who want more than a holiday.",
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Himalayan Escape — Find Your Way to the Mountains",
    description: site.description,
    images: [{ url: `${heroImage.src}?w=1200&h=630&fit=crop`, width: 1200, height: 630, alt: heroImage.alt }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05070d" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
  ],
  colorScheme: "dark light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Runs before first paint: flags JS for reveal styles and applies a saved theme choice without a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');try{var t=localStorage.getItem('he-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
