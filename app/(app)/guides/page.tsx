import type { Metadata } from "next";
import { FeaturedGuideCard } from "@/components/guides/FeaturedGuideCard";
import { GuideGrid } from "@/components/guides/GuideGrid";
import { GuidesCityHeader } from "@/components/guides/GuidesCityHeader";
import { GuidesSidebar } from "@/components/guides/GuidesSidebar";
import { getGuideItemCounts, getPublicGuides } from "@/lib/guides/queries";
import type { Guide } from "@/lib/guides/types";

export const metadata: Metadata = {
  title: "Guides | Sodoit",
  description:
    "Local plans, places worth knowing and easy ways to explore a city.",
};

interface GuidesPageProps {
  searchParams: Promise<{
    city?: string;
    q?: string;
    duration?: string;
    featured?: string;
  }>;
}

function cityCounts(guides: Guide[]) {
  const counts = new Map<string, number>();
  for (const guide of guides) {
    counts.set(guide.city, (counts.get(guide.city) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => a.city.localeCompare(b.city));
}

function matchesQuery(guide: Guide, query: string) {
  const needle = query.toLowerCase();
  return (
    guide.title.toLowerCase().includes(needle) ||
    (guide.description?.toLowerCase().includes(needle) ?? false)
  );
}

async function loadGuides(): Promise<Guide[]> {
  const guides = await getPublicGuides();
  if (guides.length > 0 || process.env.NODE_ENV !== "development") {
    return guides;
  }

  const { getDevPreviewGuides } = await import("@/lib/guides/dev-preview");
  return getDevPreviewGuides();
}

// One shared count call for whichever guides ended up on the page — real
// Supabase data or (dev-only) local preview sources use the same shape.
async function loadItemCounts(
  guideIds: string[],
): Promise<Record<string, number>> {
  if (guideIds.length === 0) return {};

  if (
    process.env.NODE_ENV === "development" &&
    guideIds[0].startsWith("preview-")
  ) {
    const { getDevPreviewItemCounts } =
      await import("@/lib/guides/dev-preview");
    return getDevPreviewItemCounts();
  }

  return getGuideItemCounts(guideIds);
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const [{ city, q, duration, featured }, guides] = await Promise.all([
    searchParams,
    loadGuides(),
  ]);

  const itemCounts = await loadItemCounts(guides.map((guide) => guide.id));

  const cities = cityCounts(guides);
  const selectedCity =
    city && cities.some((c) => c.city === city) ? city : null;

  const cityScope = selectedCity
    ? guides.filter((guide) => guide.city === selectedCity)
    : guides;

  const durationOptions = [
    ...new Set(
      cityScope
        .map((guide) => guide.duration_label)
        .filter((label): label is string => Boolean(label)),
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const hasFeatured = cityScope.some((guide) => guide.featured);
  const query = q?.trim() ?? "";
  const activeDuration =
    duration && durationOptions.includes(duration) ? duration : undefined;
  const activeFeatured = featured === "1";
  const hasActiveFilter =
    query.length > 0 || Boolean(activeDuration) || activeFeatured;

  const filtered = cityScope.filter((guide) => {
    if (query && !matchesQuery(guide, query)) return false;
    if (activeDuration && guide.duration_label !== activeDuration) return false;
    if (activeFeatured && !guide.featured) return false;
    return true;
  });

  const heroFeatured = !hasActiveFilter
    ? (cityScope.find((guide) => guide.featured) ?? null)
    : null;

  const rest = hasActiveFilter
    ? filtered
    : cityScope.filter((guide) => guide.id !== heroFeatured?.id);

  const groupByCity = !hasActiveFilter && !selectedCity && cities.length > 1;
  const citySections = groupByCity
    ? cities
        .map(({ city: c }) => ({
          city: c,
          guides: rest.filter((guide) => guide.city === c),
        }))
        .filter((section) => section.guides.length > 0)
    : [];

  const sidebarRecent = [...guides]
    .filter((guide) => guide.id !== heroFeatured?.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4);

  const hasGuides = guides.length > 0;

  return (
    <>
      <GuidesCityHeader
        cities={cities}
        selectedCity={selectedCity}
        hasGuides={hasGuides}
        durations={durationOptions}
        hasFeatured={hasFeatured}
        q={q}
        activeDuration={activeDuration}
        activeFeatured={activeFeatured}
      />

      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        {!hasGuides ? (
          <section className="py-16 sm:py-24">
            <div className="max-w-lg">
              <p className="text-sm font-semibold text-accent-dark">
                More soon
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
                We’re putting the good stuff together.
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                New local guides are on the way. We’d rather share a few great
                ones than fill the page with things that aren’t worth your time.
              </p>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
            <div className="min-w-0 space-y-10">
              {heroFeatured && (
                <section aria-labelledby="featured-plan">
                  <h2
                    id="featured-plan"
                    className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted"
                  >
                    {selectedCity
                      ? `Featured in ${selectedCity}`
                      : "Featured plan"}
                  </h2>
                  <FeaturedGuideCard
                    guide={heroFeatured}
                    stopCount={itemCounts[heroFeatured.id]}
                  />
                </section>
              )}

              {hasActiveFilter ? (
                filtered.length > 0 ? (
                  <GuideGrid
                    eyebrow={selectedCity ?? undefined}
                    title={query ? `Results for “${query}”` : "Filtered plans"}
                    guides={filtered}
                    stopCounts={itemCounts}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-ink">
                      No plans found
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Try another search or filter.
                    </p>
                  </div>
                )
              ) : groupByCity ? (
                citySections.map((section) => (
                  <GuideGrid
                    key={section.city}
                    eyebrow="Explore"
                    title={section.city}
                    guides={section.guides}
                    stopCounts={itemCounts}
                  />
                ))
              ) : (
                <GuideGrid
                  eyebrow="Explore"
                  title={
                    selectedCity ? `Plans in ${selectedCity}` : "All plans"
                  }
                  guides={rest}
                  stopCounts={itemCounts}
                />
              )}
            </div>

            <GuidesSidebar
              recentGuides={sidebarRecent}
              cities={cities}
              selectedCity={selectedCity}
            />
          </div>
        )}
      </main>
    </>
  );
}
