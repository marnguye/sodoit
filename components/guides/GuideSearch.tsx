import { Search } from "lucide-react";

interface GuideSearchProps {
  q?: string;
  city: string | null;
  duration?: string;
  featured?: string;
}

export function GuideSearch({ q, city, duration, featured }: GuideSearchProps) {
  return (
    <form
      action="/guides"
      method="GET"
      role="search"
      className="relative w-full sm:w-[360px] sm:flex-none"
    >
      {city && <input type="hidden" name="city" value={city} />}
      {duration && <input type="hidden" name="duration" value={duration} />}
      {featured && <input type="hidden" name="featured" value={featured} />}

      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        strokeWidth={2}
      />

      <label htmlFor="guide-search" className="sr-only">
        Search guides
      </label>

      <input
        id="guide-search"
        type="search"
        name="q"
        defaultValue={q ?? ""}
        placeholder="Search plans or places..."
        autoComplete="off"
        className={[
          "h-10 w-full rounded-control border border-border bg-surface",
          "pl-10 pr-4 text-sm text-ink",
          "placeholder:text-muted/80",
          "transition-colors",
          "hover:border-border-strong",
          "focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/10",
        ].join(" ")}
      />
    </form>
  );
}
