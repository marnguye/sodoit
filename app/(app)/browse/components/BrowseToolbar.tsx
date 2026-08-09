"use client";

import { useEffect, useState } from "react";
import type { StatusFilter } from "../types";
import { SearchField } from "@/components/ui/SearchField";
import { FilterGroup } from "./FilterGroup";

const STATUS_FILTERS = [
  "all",
  "uncompleted",
  "completed",
] as const satisfies readonly StatusFilter[];

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  uncompleted: "To do",
  completed: "Done",
};

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

        if (direction > 0) {
          transition(true);
        } else {
          transition(false);
        }

        movement = 0;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
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
  totalCount: number;
  signedIn: boolean;
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
  totalCount,
  signedIn,
}: BrowseToolbarProps) {
  const collapsed = useMobileToolbarCollapse();

  const collapsibleClass = (baseSpacing: string) =>
    `grid overflow-hidden transition-all duration-200 ease-out sm:!grid-rows-[1fr] sm:!opacity-100 sm:!mt-0 ${
      collapsed
        ? "grid-rows-[0fr] opacity-0 mt-0"
        : `grid-rows-[1fr] opacity-100 ${baseSpacing}`
    }`;

  return (
    <header className="sticky top-16 z-30 border-b border-border bg-background py-2.5">
      <SearchField
        value={search}
        onChange={onSearchChange}
        className="w-full"
      />

      <div className={collapsibleClass("mt-2")}>
        <div className="min-h-0 min-w-0">
          {signedIn && (
            <p className="mb-2 text-xs text-muted sm:text-sm">
              <span className="font-semibold text-ink">{completedCount}</span> /{" "}
              {totalCount} completed
            </p>
          )}

          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <FilterGroup
              label="Categories"
              options={categories}
              value={category}
              onChange={onCategoryChange}
              className="w-max pb-2"
            />
          </div>

          {signedIn && (
            <FilterGroup
              label="Completion status"
              options={STATUS_FILTERS}
              value={status}
              onChange={onStatusChange}
              variant="segmented"
              getLabel={(option) => STATUS_LABELS[option]}
              className="w-full min-w-0 sm:ml-auto sm:w-[250px]"
            />
          )}
        </div>
      </div>
    </header>
  );
}
