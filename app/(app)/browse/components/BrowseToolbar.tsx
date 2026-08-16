"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { SearchField } from "@/components/ui/SearchField";
import { ViewToggle } from "@/components/ui/ViewToggle";
import type { BrowseSort, BrowseView, StatusFilter } from "../types";
import { BrowseCategoryNav } from "./BrowseCategoryNav";
import { BrowseFilters } from "./BrowseFilters";
import { BrowseProgress } from "./BrowseProgress";
import { BrowseStatusSwitch } from "./BrowseStatusSwitch";

const MOBILE_BREAKPOINT_PX = 640;
const TOP_EXPAND_PX = 80;
const SCROLL_INTENT_THRESHOLD_PX = 28;
const TRANSITION_GUARD_MS = 200;

function useMobileToolbarCollapse() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let direction = 0;
    let movement = 0;
    let ignoreUntil = 0;
    let isCollapsed = false;
    let frame: number | null = null;

    function resetMovement(y: number) {
      lastY = y;
      direction = 0;
      movement = 0;
    }

    function transition(nextCollapsed: boolean) {
      if (isCollapsed === nextCollapsed) return;

      isCollapsed = nextCollapsed;
      ignoreUntil = performance.now() + TRANSITION_GUARD_MS;
      movement = 0;
      setCollapsed(nextCollapsed);
    }

    function handleScroll() {
      if (frame !== null) return;

      frame = requestAnimationFrame(() => {
        frame = null;

        const y = window.scrollY;

        if (window.innerWidth >= MOBILE_BREAKPOINT_PX) {
          transition(false);
          resetMovement(y);
          return;
        }

        if (y < TOP_EXPAND_PX) {
          transition(false);
          resetMovement(y);
          return;
        }

        const delta = y - lastY;
        lastY = y;

        if (performance.now() < ignoreUntil || delta === 0) return;

        const nextDirection = Math.sign(delta);

        if (nextDirection === direction) {
          movement += Math.abs(delta);
        } else {
          direction = nextDirection;
          movement = Math.abs(delta);
        }

        if (movement < SCROLL_INTENT_THRESHOLD_PX) return;

        transition(direction > 0);
        movement = 0;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return collapsed;
}

interface BrowseToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: readonly string[];
  category: string;
  onCategoryChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  completedCount: number;
  signedIn: boolean;
  view: BrowseView;
  onViewChange: (value: BrowseView) => void;
  sort: BrowseSort;
  onSortChange: (value: BrowseSort) => void;
  difficulty: string | null;
  onDifficultyChange: (value: string | null) => void;
}

export function BrowseToolbar({
  search,
  onSearchChange,
  categories,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  completedCount,
  signedIn,
  view,
  onViewChange,
  sort,
  onSortChange,
  difficulty,
  onDifficultyChange,
}: BrowseToolbarProps) {
  const collapsed = useMobileToolbarCollapse();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtersActive = difficulty !== null || sort !== "recommended";

  return (
    <header className="sticky top-16 z-30 border-b border-border bg-background py-2.5">
      <SearchField
        value={search}
        onChange={onSearchChange}
        className="w-full"
      />

      <div
        className={[
          "grid overflow-hidden transition-all duration-200 ease-out",
          "sm:!mt-1 sm:!grid-rows-[1fr] sm:!overflow-visible sm:!opacity-100",
          collapsed
            ? "mt-0 grid-rows-[0fr] opacity-0"
            : "mt-1 grid-rows-[1fr] opacity-100",
        ].join(" ")}
      >
        <div className="min-h-0 min-w-0">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-1">
            <BrowseCategoryNav
              categories={categories}
              category={category}
              onCategoryChange={onCategoryChange}
            />

            <div className="flex items-center gap-1 sm:contents">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  aria-haspopup="dialog"
                  className={[
                    "inline-flex h-8 items-center gap-1.5 rounded-control border px-3",
                    "text-xs font-semibold transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                    filtersActive
                      ? "border-accent/40 bg-accent-wash text-accent-dark"
                      : "border-border bg-surface text-secondary hover:border-border-strong hover:text-ink",
                  ].join(" ")}
                >
                  <SlidersHorizontal
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                  Filters
                </button>

                <BrowseFilters
                  open={filtersOpen}
                  onClose={() => setFiltersOpen(false)}
                  sort={sort}
                  onSortChange={onSortChange}
                  difficulty={difficulty}
                  onDifficultyChange={onDifficultyChange}
                />
              </div>

              <ViewToggle view={view} onChange={onViewChange} />
            </div>
          </div>

          {signedIn && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <BrowseProgress completedCount={completedCount} />

              <BrowseStatusSwitch
                status={status}
                onStatusChange={onStatusChange}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
