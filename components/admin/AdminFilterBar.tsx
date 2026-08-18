"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Search } from "lucide-react";

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminFilterConfig {
  key: string;
  label: string;
  options: AdminFilterOption[];
}

interface AdminFilterBarProps {
  basePath: string;
  searchPlaceholder?: string;
  filters?: AdminFilterConfig[];
}

const SELECT_CLASS =
  "h-10 rounded-control border border-border bg-surface px-3 text-sm text-ink transition-colors hover:border-border-strong focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/10";

export function AdminFilterBar({
  basePath,
  searchPlaceholder = "Search...",
  filters = [],
}: AdminFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ q: value }), 300);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label className="relative w-full max-w-xs">
        <span className="sr-only">Search</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className={`${SELECT_CLASS} w-full pl-9`}
        />
      </label>

      {filters.map((filter) => (
        <select
          key={filter.key}
          value={searchParams.get(filter.key) ?? ""}
          onChange={(event) => pushParams({ [filter.key]: event.target.value })}
          className={SELECT_CLASS}
          aria-label={filter.label}
        >
          <option value="">{filter.label}: All</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
