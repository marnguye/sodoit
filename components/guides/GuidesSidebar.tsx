import Link from "next/link";
import type { Guide } from "@/lib/guides/types";
import { guidesUrl } from "@/lib/guides/url";
import { GuideCover } from "./GuideCover";

interface CityCount {
  city: string;
  count: number;
}

interface GuidesSidebarProps {
  recentGuides: Guide[];
  cities: CityCount[];
  selectedCity: string | null;
}

function SidebarGuideRow({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex items-center gap-3"
    >
      <GuideCover
        imageUrl={guide.cover_image_url}
        imageAlt={guide.cover_image_alt}
        title={guide.title}
        sizes="48px"
        className="aspect-square w-12 shrink-0 overflow-hidden rounded-lg"
      />

      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-ink transition-colors group-hover:text-accent-dark">
          {guide.title}
        </span>
        <span className="block text-xs text-muted">
          {guide.city}
          {guide.duration_label ? ` · ${guide.duration_label}` : ""}
        </span>
      </span>
    </Link>
  );
}

export function GuidesSidebar({
  recentGuides,
  cities,
  selectedCity,
}: GuidesSidebarProps) {
  const otherCities =
    cities.length > 1
      ? selectedCity
        ? cities.filter((c) => c.city !== selectedCity)
        : cities
      : [];

  if (recentGuides.length === 0 && otherCities.length === 0) return null;

  return (
    <aside className="space-y-7 lg:sticky lg:top-20 lg:self-start">
      {recentGuides.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Recently added
          </h3>
          <div className="mt-3 space-y-3">
            {recentGuides.map((guide) => (
              <SidebarGuideRow key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      )}

      {otherCities.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {selectedCity ? "Explore other cities" : "Explore cities"}
          </h3>
          <div className="mt-3 space-y-1">
            {otherCities.map(({ city, count }) => (
              <Link
                key={city}
                href={guidesUrl({ city })}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-accent-wash"
              >
                <span>{city}</span>
                <span className="text-xs font-normal text-muted">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
