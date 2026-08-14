"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function ShareGuideButton({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-border-strong ${className}`}
    >
      <Share2 aria-hidden="true" className="h-4 w-4" />
      {copied ? "Link copied" : "Share guide"}
    </button>
  );
}
