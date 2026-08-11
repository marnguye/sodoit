"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>

        <p className="mt-2 text-sm text-muted">
          Something unexpected happened. Please try again.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>

          <Link
            href="/"
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-ink"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
