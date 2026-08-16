"use client";

import { Bookmark } from "lucide-react";

interface SaveButtonProps {
  label: string;
  onClick: () => void;
  saved?: boolean;
  className?: string;
}

export function SaveButton({
  label,
  onClick,
  saved = false,
  className = "",
}: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "pointer-events-auto relative z-20 inline-flex h-8 w-8 shrink-0",
        "items-center justify-center rounded-control transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        saved
          ? "text-accent hover:bg-accent-wash"
          : "text-muted hover:bg-surface-subtle hover:text-ink",
        className,
      ].join(" ")}
    >
      <Bookmark
        aria-hidden="true"
        className="h-4 w-4"
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
