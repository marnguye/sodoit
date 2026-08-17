import Link from "next/link";

interface AdminPaginationProps {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  pageCount: number;
}

export function AdminPagination({
  basePath,
  searchParams,
  page,
  pageCount,
}: AdminPaginationProps) {
  if (pageCount <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    else params.delete("page");
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <nav className="mt-4 flex items-center justify-between text-sm text-muted">
      <span>
        Page {page} of {pageCount}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={hrefFor(page - 1)}
          aria-disabled={page <= 1}
          className={`rounded-control border border-border px-3 py-1.5 transition-colors ${
            page <= 1
              ? "pointer-events-none opacity-40"
              : "hover:border-border-strong hover:text-ink"
          }`}
        >
          Previous
        </Link>
        <Link
          href={hrefFor(page + 1)}
          aria-disabled={page >= pageCount}
          className={`rounded-control border border-border px-3 py-1.5 transition-colors ${
            page >= pageCount
              ? "pointer-events-none opacity-40"
              : "hover:border-border-strong hover:text-ink"
          }`}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}
