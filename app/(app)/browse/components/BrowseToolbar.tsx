"use client";

import type { StatusFilter } from "../types";
import { SearchField } from "@/components/ui/SearchField";
import { FilterGroup } from "./FilterGroup";

const STATUS_FILTERS = [
  "all",
  "completed",
  "uncompleted",
] as const satisfies readonly StatusFilter[];

interface BrowseToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
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
  return (
    <header className="sticky top-16 z-10 bg-background/95 backdrop-blur border-b border-border py-4 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <SearchField value={search} onChange={onSearchChange} />
        {signedIn && (
          <p
            className="text-sm text-muted whitespace-nowrap"
            aria-live="polite"
          >
            <strong className="text-ink font-bold">{completedCount}</strong> /{" "}
            {totalCount} completed
          </p>
        )}
      </div>

      <nav
        aria-label="Marketplace filters"
        className="flex items-center justify-between gap-4"
      >
        <FilterGroup
          label="Categories"
          options={categories}
          value={category}
          onChange={onCategoryChange}
          className="flex min-w-0 gap-2 overflow-x-auto"
          buttonClassName="h-8 shrink-0"
          inactiveClassName="bg-white border border-border text-muted hover:text-ink"
        />
        {signedIn && (
          <FilterGroup
            label="Completion status"
            options={STATUS_FILTERS}
            value={status}
            onChange={onStatusChange}
            className="flex shrink-0 gap-1 bg-white border border-border rounded-full p-1 capitalize"
            buttonClassName="h-7"
            inactiveClassName="text-muted hover:text-ink"
          />
        )}
      </nav>
    </header>
  );
}
