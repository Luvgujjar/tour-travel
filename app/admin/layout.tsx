import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Himalayan Escape" },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-dvh bg-night">{children}</div>;
}
