"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import type { StatusFilter } from "../types";

const STATUS_TABS: StatusFilter[] = ["all", "completed", "uncompleted"];

export function MarketplaceHeader({
  search,
  onSearchChange,
  categories,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  completedCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  category: string;
  onCategoryChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  completedCount: number;
  totalCount: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-8 py-4 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search the marketplace..."
            className="w-full h-11 border border-border rounded-xl pl-10 pr-16 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted bg-background border border-border rounded px-1.5 py-0.5">
            ⌘K
          </span>
        </div>
        <p className="text-sm text-muted whitespace-nowrap">
          <span className="text-ink font-bold">{completedCount}</span> /{" "}
          {totalCount} completed
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors ${
                category === c
                  ? "bg-accent text-white"
                  : "bg-white border border-border text-muted hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-white border border-border rounded-full p-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`h-7 px-3 rounded-full text-xs font-semibold capitalize transition-colors ${
                status === s
                  ? "bg-accent text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
