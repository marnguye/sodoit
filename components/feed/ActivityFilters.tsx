import Link from "next/link";
import type { ActivityFilter } from "@/app/(app)/feed/data";

const FILTER_LABELS: Record<ActivityFilter, string> = {
  all: "All",
  completed: "Completed",
  added_to_list: "Added to list",
  collections: "Collections",
};

const FILTER_ORDER: readonly ActivityFilter[] = [
  "all",
  "completed",
  "added_to_list",
  "collections",
];

export function ActivityFilters({ active }: { active: ActivityFilter }) {
  return (
    <div
      role="group"
      aria-label="Activity filters"
      className="flex flex-wrap gap-2"
    >
      {FILTER_ORDER.map((filter) => {
        const selected = filter === active;
        const href = filter === "all" ? "/feed" : `/feed?filter=${filter}`;

        return (
          <Link
            key={filter}
            href={href}
            aria-pressed={selected}
            className={[
              "inline-flex h-8 shrink-0 items-center rounded-control border px-3.5 text-xs font-semibold transition-colors",
              selected
                ? "border-accent/40 bg-accent-wash text-accent-dark"
                : "border-border bg-surface text-secondary hover:border-border-strong hover:text-ink",
            ].join(" ")}
          >
            {FILTER_LABELS[filter]}
          </Link>
        );
      })}
    </div>
  );
}
