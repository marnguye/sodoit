import Image from "next/image";
import { MapPin } from "lucide-react";
import type { GuideCity } from "@/lib/guides/types";
import { CitySelector } from "@/components/guides/CitySelector";
import { discoveryUrl } from "@/lib/discovery/url";

interface CityCount {
  city: string;
  count: number;
}

interface DiscoveryHeroProps {
  cities: CityCount[];
  selectedCity: string | null;
  hero: GuideCity | null;
}

export function DiscoveryHero({
  cities,
  selectedCity,
  hero,
}: DiscoveryHeroProps) {
  const badgeCity = hero?.city ?? selectedCity;
  const title =
    hero?.title ??
    (selectedCity
      ? `Find the best ways to experience ${selectedCity}`
      : "Find the best ways to experience your next city");
  const description =
    hero?.description ??
    "Curated routes, local spots, and ideas from people who know the city best.";

  return (
    <section className="relative min-h-[360px] overflow-hidden bg-ink sm:min-h-[440px]">
      {hero?.hero_image_url && (
        <Image
          src={hero.hero_image_url}
          alt={hero.hero_image_alt ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

      <div className="relative mx-auto flex h-full max-w-[1200px] flex-col justify-end px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {badgeCity && (
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-control bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <MapPin
              aria-hidden="true"
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />
            {badgeCity}
          </span>
        )}

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Discovery
        </p>

        <h1 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
          {description}
        </p>

        {cities.length > 1 && (
          <div className="mt-5">
            <CitySelector
              cities={cities}
              selectedCity={selectedCity}
              basePath="/discovery"
              urlFor={(city) => discoveryUrl({ city })}
            />
          </div>
        )}
      </div>
    </section>
  );
}
