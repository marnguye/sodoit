import Image from "next/image";
import type { GuideCity } from "@/lib/guides/types";

import { CitySelector } from "./CitySelector";
import { GuideFilters } from "./GuideFilters";
import { GuideSearch } from "./GuideSearch";

interface CityCount {
  city: string;
  count: number;
}

interface GuidesCityHeaderProps {
  cities: CityCount[];
  selectedCity: string | null;
  hasGuides: boolean;
  durations: string[];
  hasFeatured: boolean;
  q?: string;
  activeDuration?: string;
  activeFeatured: boolean;
  hero: GuideCity | null;
}

export function GuidesCityHeader({
  cities,
  selectedCity,
  hasGuides,
  durations,
  hasFeatured,
  q,
  activeDuration,
  activeFeatured,
  hero,
}: GuidesCityHeaderProps) {
  const heroImageUrl = hero?.hero_image_url;
  const eyebrow = hero?.eyebrow ?? selectedCity ?? "Guides";
  const title =
    hero?.title ??
    (selectedCity
      ? `Plans for a great day in ${selectedCity}`
      : "Guides for real life");
  const description =
    hero?.description ??
    (selectedCity
      ? "Pick a ready-made route and make the most of your time."
      : "Pick a city and find a plan worth going out for.");

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="sr-only">Guides</h1>

        <div className="relative min-h-[320px] overflow-hidden rounded-panel bg-ink sm:min-h-[380px]">
          {heroImageUrl && (
            <Image
              src={heroImageUrl}
              alt={hero?.hero_image_alt ?? ""}
              fill
              preload
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/5" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
            {cities.length > 0 && (
              <CitySelector cities={cities} selectedCity={selectedCity} />
            )}

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
              {eyebrow}
            </p>

            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">
              {title}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
              {description}
            </p>
          </div>
        </div>

        {hasGuides && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <GuideSearch
              q={q}
              city={selectedCity}
              duration={activeDuration}
              featured={activeFeatured ? "1" : undefined}
            />

            <GuideFilters
              durations={durations}
              hasFeatured={hasFeatured}
              activeDuration={activeDuration}
              activeFeatured={activeFeatured}
              city={selectedCity}
              q={q}
            />
          </div>
        )}
      </div>
    </section>
  );
}
