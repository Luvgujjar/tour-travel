import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-display text-8xl font-semibold text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-semibold">This trail doesn&apos;t exist</h1>
        <p className="mt-2 text-mist">The page may have moved, or the package is no longer available.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">Back home</Link>
          <Link href="/packages" className="btn btn-ghost">Browse packages</Link>
        </div>
      </div>
    </main>
  );
}
