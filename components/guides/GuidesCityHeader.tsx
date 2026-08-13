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
}: GuidesCityHeaderProps) {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="sr-only">Guides</h1>

        {cities.length > 0 && (
          <CitySelector cities={cities} selectedCity={selectedCity} />
        )}

        <h2
          className={[
            "text-2xl font-extrabold tracking-tight text-ink sm:text-3xl",
            cities.length > 0 ? "mt-4" : "",
          ].join(" ")}
        >
          {selectedCity
            ? `Plans for a great day in ${selectedCity}`
            : "Guides for real life"}
        </h2>

        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">
          {selectedCity
            ? "Pick a ready-made route and make the most of your time."
            : "Pick a city and find a plan worth going out for."}
        </p>

        {hasGuides && (
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
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
