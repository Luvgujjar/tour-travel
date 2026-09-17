import type { Metadata } from "next";
import Link from "next/link";
import { Background3D } from "@/components/site/background-3d";
import { LoginForm } from "@/components/admin/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui";
import { adminCredentials } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const { insecure } = adminCredentials();
  return (
    <main className="relative isolate grid min-h-dvh place-items-center px-4">
      <Background3D />
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="rise w-full max-w-sm">
        <Link href="/" className="mb-6 flex justify-center">
          <Logo />
        </Link>
        <div className="glow-card p-7">
          <h1 className="text-2xl font-semibold">Admin console</h1>
          <p className="mt-1 mb-6 text-sm text-mist">Sign in to manage packages, enquiries and insights.</p>
          <LoginForm
            next={typeof next === "string" ? next : "/admin"}
            hint={insecure ? "Dev mode: ADMIN_PASSWORD is not set, using admin / admin." : undefined}
          />
        </div>
      </div>
    </main>
  );
}
