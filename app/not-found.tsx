import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-accent">404</p>

        <h1 className="mt-2 text-2xl font-bold text-ink">Page not found</h1>

        <p className="mt-2 text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Browse
        </Link>
      </div>
    </main>
  );
}
