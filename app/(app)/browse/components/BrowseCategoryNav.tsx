"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  BrowseChip,
  CONTROL_BASE,
  CONTROL_ACTIVE,
  CONTROL_IDLE,
} from "./BrowseChip";

const PRIMARY_VISIBLE = 4;

interface BrowseCategoryNavProps {
  categories: readonly string[];
  category: string;
  onCategoryChange: (value: string) => void;
}

function splitCategories(categories: readonly string[], category: string) {
  const primary = categories.slice(0, PRIMARY_VISIBLE + 1);
  const overflow = categories.slice(PRIMARY_VISIBLE + 1);

  if (!overflow.includes(category)) {
    return { primary, overflow };
  }

  return {
    primary: [...primary, category],
    overflow: overflow.filter((option) => option !== category),
  };
}

export function BrowseCategoryNav({
  categories,
  category,
  onCategoryChange,
}: BrowseCategoryNavProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { primary, overflow } = splitCategories(categories, category);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(value: string) {
    setOpen(false);
    onCategoryChange(value);
  }

  return (
    <div
      role="group"
      aria-label="Categories"
      className="flex min-w-0 flex-1 items-center gap-1"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        {primary.map((option) => (
          <BrowseChip
            key={option}
            selected={option === category}
            onClick={() => onCategoryChange(option)}
          >
            {option}
          </BrowseChip>
        ))}

        {overflow.map((option) => (
          <BrowseChip
            key={option}
            selected={false}
            onClick={() => onCategoryChange(option)}
            className="lg:hidden"
          >
            {option}
          </BrowseChip>
        ))}
      </div>

      {overflow.length > 0 && (
        <div ref={containerRef} className="relative hidden shrink-0 lg:block">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="menu"
            className={[
              CONTROL_BASE,
              "px-3",
              open ? CONTROL_ACTIVE : CONTROL_IDLE,
            ].join(" ")}
          >
            More
            <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
          </button>

          {open && (
            <div
              role="menu"
              aria-label="More categories"
              className="absolute right-0 top-full z-40 mt-1 w-44 rounded-panel border border-border bg-surface p-1"
            >
              {overflow.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="menuitem"
                  onClick={() => select(option)}
                  className="flex w-full items-center rounded-control px-3 py-1.5 text-left text-xs font-semibold text-secondary transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
