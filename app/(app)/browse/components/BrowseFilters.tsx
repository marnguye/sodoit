"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { BrowseChip } from "./BrowseChip";
import { BROWSE_SORTS, DIFFICULTIES, SORT_LABELS } from "../types";
import type { BrowseSort } from "../types";

interface BrowseFiltersProps {
  open: boolean;
  onClose: () => void;
  sort: BrowseSort;
  onSortChange: (sort: BrowseSort) => void;
  difficulty: string | null;
  onDifficultyChange: (difficulty: string | null) => void;
}

const DIFFICULTY_OPTIONS = ["All", ...DIFFICULTIES.map(({ label }) => label)];

export function BrowseFilters({
  open,
  onClose,
  sort,
  onSortChange,
  difficulty,
  onDifficultyChange,
}: BrowseFiltersProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/20 sm:hidden"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-label="Browse filters"
        tabIndex={-1}
        className={[
          "fixed inset-x-0 bottom-0 z-50 bg-surface p-5 outline-none",
          "rounded-t-panel border-t border-border",

          "sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2",
          "sm:w-[280px] sm:rounded-panel sm:border sm:border-border",
          "sm:p-4 sm:shadow-popover",
        ].join(" ")}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink">Filters</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Sort by
            </h3>

            <div
              role="group"
              aria-label="Sort"
              className="flex flex-wrap gap-1"
            >
              {BROWSE_SORTS.map((option) => (
                <BrowseChip
                  key={option}
                  selected={option === sort}
                  onClick={() => onSortChange(option)}
                >
                  {SORT_LABELS[option]}
                </BrowseChip>
              ))}
            </div>
          </section>

          <div className="border-t border-border" />

          <section>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Difficulty
            </h3>

            <div
              role="group"
              aria-label="Difficulty"
              className="flex flex-wrap gap-1"
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <BrowseChip
                  key={option}
                  selected={option === (difficulty ?? "All")}
                  onClick={() =>
                    onDifficultyChange(option === "All" ? null : option)
                  }
                >
                  {option}
                </BrowseChip>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
