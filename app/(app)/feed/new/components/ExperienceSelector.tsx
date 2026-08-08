"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { getTaskMeta } from "@/app/(app)/browse/types";

export interface ExperienceOption {
  id: string;
  title: string;
}

interface ExperienceSelectorProps {
  experiences: ExperienceOption[];
  value: ExperienceOption | null;
  onChange: (experience: ExperienceOption | null) => void;
}

export function ExperienceSelector({
  experiences,
  value,
  onChange,
}: ExperienceSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  if (value) {
    const { thumbnail } = getTaskMeta(value.id);

    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
        <span
          aria-hidden="true"
          className="h-10 w-10 shrink-0 rounded-lg"
          style={{ backgroundColor: thumbnail }}
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
          {value.title}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove linked experience"
          className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-border/50 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const trimmed = query.trim().toLowerCase();
  const matches = (
    trimmed
      ? experiences.filter((experience) =>
          experience.title.toLowerCase().includes(trimmed),
        )
      : experiences
  ).slice(0, 6);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="Search for an experience..."
        aria-label="Search for an experience"
        className="h-11 w-full rounded-md border border-border bg-white pl-10 pr-3.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
      />

      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-white shadow-lg">
          {matches.map((experience) => (
            <li key={experience.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(experience);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center px-3.5 py-2.5 text-left text-sm text-ink transition-colors hover:bg-background"
              >
                {experience.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
