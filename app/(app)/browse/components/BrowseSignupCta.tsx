"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface BrowseSignupCtaProps {
  compact?: boolean;
}

export function BrowseSignupCta({ compact = false }: BrowseSignupCtaProps) {
  const router = useRouter();

  return (
    <section
      className={[
        "rounded-panel border border-accent/15 bg-accent-wash",
        compact ? "p-4" : "p-5",
      ].join(" ")}
    >
      {!compact && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-accent-dark">
          <Bookmark aria-hidden="true" className="h-5 w-5" />
        </div>
      )}

      <h2
        className={[
          "font-bold tracking-tight text-ink",
          compact ? "text-base" : "text-lg",
        ].join(" ")}
      >
        Start your life list
      </h2>

      <p
        className={[
          "text-secondary",
          compact ? "mt-1 text-sm leading-5" : "mt-2 text-sm leading-6",
        ].join(" ")}
      >
        Save the things you want to experience and keep track as you complete
        them.
      </p>

      <Button
        type="button"
        onClick={() => router.push("/signup")}
        className={compact ? "mt-3 w-full" : "mt-5 w-full"}
      >
        Create my list
      </Button>

      <p
        className={[
          "text-center text-xs text-secondary",
          compact ? "mt-3" : "mt-4 border-t border-accent/10 pt-4",
        ].join(" ")}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="rounded-control font-semibold text-accent-dark transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          Log in
        </Link>
      </p>
    </section>
  );
}
