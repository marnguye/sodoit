import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}

const SIBLINGS = 1;

function getPageNumbers(
  page: number,
  pageCount: number,
): (number | "ellipsis")[] {
  const pages = new Set<number>([1, pageCount]);

  for (let p = page - SIBLINGS; p <= page + SIBLINGS; p += 1) {
    if (p >= 1 && p <= pageCount) {
      pages.add(p);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];

  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) {
      result.push("ellipsis");
    }

    result.push(p);
  });

  return result;
}

const BUTTON_CLASS =
  "flex h-8 min-w-8 items-center justify-center rounded-control border border-border px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

export function Pagination({ page, pageCount, buildHref }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const pages = getPageNumbers(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
    >
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        aria-label="Previous page"
        className={`${BUTTON_CLASS} gap-1 bg-surface text-muted ${
          page === 1
            ? "pointer-events-none opacity-40"
            : "hover:border-border-strong hover:text-ink"
        }`}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Previous
      </Link>

      {pages.map((entry, index) =>
        entry === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="px-1 text-xs text-muted"
          >
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={buildHref(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={`${BUTTON_CLASS} ${
              entry === page
                ? "border-accent bg-accent text-white"
                : "bg-surface text-muted hover:border-border-strong hover:text-ink"
            }`}
          >
            {entry}
          </Link>
        ),
      )}

      <Link
        href={buildHref(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        aria-label="Next page"
        className={`${BUTTON_CLASS} gap-1 bg-surface text-muted ${
          page === pageCount
            ? "pointer-events-none opacity-40"
            : "hover:border-border-strong hover:text-ink"
        }`}
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </nav>
  );
}
