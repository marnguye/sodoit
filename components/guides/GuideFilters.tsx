import Link from "next/link";
import { Clock3, Sparkles } from "lucide-react";
import { guidesUrl } from "@/lib/guides/url";

interface GuideFiltersProps {
  durations: string[];
  hasFeatured: boolean;
  activeDuration?: string;
  activeFeatured: boolean;
  city: string | null;
  q?: string;
}

function pillClass(active: boolean) {
  return [
    "shrink-0 rounded-control border px-3.5 py-2 text-xs font-semibold",
    "transition-colors sm:text-sm",
    active
      ? "border-accent/30 bg-accent-wash text-accent-dark"
      : "border-border bg-surface text-muted hover:border-border-strong hover:text-ink",
  ].join(" ");
}

export function GuideFilters({
  durations,
  hasFeatured,
  activeDuration,
  activeFeatured,
  city,
  q,
}: GuideFiltersProps) {
  if (durations.length === 0 && !hasFeatured) {
    return null;
  }

  const base = {
    city: city ?? undefined,
    q,
  };

  return (
    <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
      <Link
        href={guidesUrl(base)}
        className={pillClass(!activeDuration && !activeFeatured)}
      >
        All
      </Link>

      {hasFeatured && (
        <Link
          href={guidesUrl({
            ...base,
            featured: "1",
          })}
          className={`${pillClass(activeFeatured)} inline-flex items-center gap-1.5`}
        >
          <Sparkles
            aria-hidden="true"
            className="h-3.5 w-3.5"
            strokeWidth={2}
          />
          Featured
        </Link>
      )}

      {durations.map((duration) => {
        const active = activeDuration === duration;

        return (
          <Link
            key={duration}
            href={guidesUrl({
              ...base,
              duration,
            })}
            className={`${pillClass(active)} inline-flex items-center gap-1.5`}
          >
            <Clock3
              aria-hidden="true"
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />

            {duration}
          </Link>
        );
      })}
    </div>
  );
}
