import Link from "next/link";
import type { ActivityFilter } from "@/app/(app)/feed/data";

interface ActivityPaginationProps {
  filter: ActivityFilter;
  page: number;
  hasMore: boolean;
}

function hrefFor(filter: ActivityFilter, page: number) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/feed?${query}` : "/feed";
}

export function ActivityPagination({
  filter,
  page,
  hasMore,
}: ActivityPaginationProps) {
  if (page === 1 && !hasMore) return null;

  return (
    <nav className="mt-6 flex items-center justify-between text-sm text-muted">
      <span>Page {page}</span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(filter, page - 1)}
            className="rounded-control border border-border px-3 py-1.5 transition-colors hover:border-border-strong hover:text-ink"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-control border border-border px-3 py-1.5 opacity-40">
            Previous
          </span>
        )}
        {hasMore ? (
          <Link
            href={hrefFor(filter, page + 1)}
            className="rounded-control border border-border px-3 py-1.5 transition-colors hover:border-border-strong hover:text-ink"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-control border border-border px-3 py-1.5 opacity-40">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
