"use client";

import { Bookmark, Check } from "lucide-react";

interface ExperienceSaveControlProps {
  mode: "guest" | "toggle";
  done?: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  className?: string;
}

export function ExperienceSaveControl({
  mode,
  done = false,
  onClick,
  disabled = false,
  label,
  className = "",
}: ExperienceSaveControlProps) {
  const isComplete = mode === "toggle" && done;

  return (
    <button
      type="button"
      role={mode === "toggle" ? "checkbox" : undefined}
      aria-checked={mode === "toggle" ? done : undefined}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "pointer-events-auto relative z-20 inline-flex h-9 w-9 shrink-0",
        "items-center justify-center rounded-control border backdrop-blur-sm",
        "transition-colors duration-200 outline-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        "disabled:pointer-events-none disabled:opacity-60",
        isComplete
          ? "border-accent bg-accent text-white"
          : "border-border/70 bg-surface/90 text-ink hover:border-border-strong",
        className,
      ].join(" ")}
    >
      {isComplete ? (
        <Check aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
      ) : (
        <Bookmark aria-hidden="true" className="h-4 w-4" />
      )}
    </button>
  );
}
