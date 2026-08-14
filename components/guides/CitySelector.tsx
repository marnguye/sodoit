import Link from "next/link";
import { Check, ChevronDown, MapPin } from "lucide-react";

interface CityCount {
  city: string;
  count: number;
}

interface CitySelectorProps {
  cities: CityCount[];
  selectedCity: string | null;
  basePath: string;
  urlFor: (city?: string) => string;
}

export function CitySelector({
  cities,
  selectedCity,
  basePath,
  urlFor,
}: CitySelectorProps) {
  if (cities.length === 0) {
    return null;
  }

  const label =
    selectedCity ?? (cities.length === 1 ? cities[0].city : "All cities");

  if (cities.length === 1) {
    return (
      <span className="inline-flex items-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink">
        <MapPin
          aria-hidden="true"
          className="h-4 w-4 text-accent"
          strokeWidth={2}
        />
        {label}
      </span>
    );
  }

  return (
    <details className="group relative inline-block">
      <summary
        className={[
          "flex w-fit cursor-pointer list-none items-center gap-2 rounded-pill",
          "border border-border bg-surface px-3.5 py-2",
          "text-sm font-semibold text-ink",
          "transition-colors hover:border-border-strong hover:bg-surface-subtle",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          "[&::-webkit-details-marker]:hidden",
        ].join(" ")}
      >
        <MapPin
          aria-hidden="true"
          className="h-4 w-4 text-accent"
          strokeWidth={2}
        />

        <span>{label}</span>

        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 text-muted transition-transform duration-200 group-open:rotate-180"
        />
      </summary>

      <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-[220px] overflow-hidden rounded-panel border border-border bg-surface p-1.5 shadow-popover">
        <Link
          href={basePath}
          className="flex items-center justify-between gap-3 rounded-control px-3 py-2.5 text-sm transition-colors hover:bg-accent-wash"
        >
          <span
            className={
              selectedCity === null
                ? "font-semibold text-ink"
                : "font-medium text-ink"
            }
          >
            All cities
          </span>

          {selectedCity === null && (
            <Check
              aria-hidden="true"
              className="h-4 w-4 text-accent"
              strokeWidth={2.25}
            />
          )}
        </Link>

        <div className="my-1 border-t border-border" />

        {cities.map(({ city, count }) => {
          const active = city === selectedCity;

          return (
            <Link
              key={city}
              href={urlFor(city)}
              className="flex items-center justify-between gap-3 rounded-control px-3 py-2.5 text-sm transition-colors hover:bg-accent-wash"
            >
              <div className="min-w-0">
                <p
                  className={[
                    "truncate",
                    active ? "font-semibold text-ink" : "font-medium text-ink",
                  ].join(" ")}
                >
                  {city}
                </p>

                <p className="mt-0.5 text-xs text-muted">
                  {count} {count === 1 ? "plan" : "plans"}
                </p>
              </div>

              {active && (
                <Check
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-accent"
                  strokeWidth={2.25}
                />
              )}
            </Link>
          );
        })}
      </div>
    </details>
  );
}
