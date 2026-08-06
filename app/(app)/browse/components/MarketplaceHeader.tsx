"use client";

import type { StatusFilter } from "../types";
import { SearchField } from "@/components/ui/SearchField";
import { FilterGroup } from "./FilterGroup";

const STATUS_FILTERS = [
  "all",
  "completed",
  "uncompleted",
] as const satisfies readonly StatusFilter[];

interface MarketplaceHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  category: string;
  onCategoryChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  completedCount: number;
  totalCount: number;
}

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
}: MarketplaceHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-8 py-4 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <SearchField value={search} onChange={onSearchChange} />
        <p className="text-sm text-muted whitespace-nowrap" aria-live="polite">
          <strong className="text-ink font-bold">{completedCount}</strong> /{" "}
          {totalCount} completed
        </p>
      </div>

      <nav
        aria-label="Marketplace filters"
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <FilterGroup
          label="Categories"
          options={categories}
          value={category}
          onChange={onCategoryChange}
          className="flex gap-2 flex-wrap"
          buttonClassName="h-8"
          inactiveClassName="bg-white border border-border text-muted hover:text-ink"
        />
        <FilterGroup
          label="Completion status"
          options={STATUS_FILTERS}
          value={status}
          onChange={onStatusChange}
          className="flex gap-1 bg-white border border-border rounded-full p-1 capitalize"
          buttonClassName="h-7"
          inactiveClassName="text-muted hover:text-ink"
        />
      </nav>
    </header>
  );
}
