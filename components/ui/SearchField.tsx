"use client";

import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchField({
  value,
  onChange,
  className = "",
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);

    return () => {
      window.removeEventListener("keydown", focusSearch);
    };
  }, []);

  return (
    <label className={`relative block w-full ${className}`}>
      <span className="sr-only">Search experiences</span>

      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search experiences..."
        aria-keyshortcuts="Meta+K Control+K"
        className={[
          "h-10 w-full rounded-control border border-border bg-surface",
          "pl-10 pr-3.5 text-sm text-ink",
          "placeholder:text-muted",
          "transition-colors",
          "hover:border-border-strong",
          "focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/10",
          "sm:pr-16",
        ].join(" ")}
      />

      <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center gap-0.5 sm:flex">
        <kbd
          aria-hidden="true"
          className="rounded border border-border bg-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold text-muted"
        >
          ⌘
        </kbd>
        <kbd
          aria-hidden="true"
          className="rounded border border-border bg-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold text-muted"
        >
          K
        </kbd>
      </div>
    </label>
  );
}
