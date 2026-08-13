import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Guide } from "@/lib/guides/types";
import { GuideCover } from "./GuideCover";

export function FeaturedGuideCard({
  guide,
  stopCount,
}: {
  guide: Guide;
  stopCount?: number;
}) {
  const meta = [guide.duration_label, stopCount ? `${stopCount} stops` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={[
        "group block overflow-hidden rounded-panel bg-surface",
        "outline-none ring-1 ring-border",
        "transition-colors hover:ring-ink/15",
        "focus-visible:ring-2 focus-visible:ring-accent",
        "sm:grid sm:grid-cols-[1.05fr_0.95fr]",
      ].join(" ")}
    >
      <GuideCover
        imageUrl={guide.cover_image_url}
        imageAlt={guide.cover_image_alt}
        title={guide.title}
        priority
        sizes="(min-width: 640px) 52vw, 100vw"
        className="aspect-[16/10] w-full sm:aspect-auto sm:min-h-[320px] sm:h-full"
      />

      <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-9">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5 text-accent-dark">
              <MapPin
                aria-hidden="true"
                className="h-3.5 w-3.5"
                strokeWidth={2}
              />
              {guide.city}
            </span>

            {meta && (
              <>
                <span aria-hidden="true" className="text-border">
                  •
                </span>
                <span>{meta}</span>
              </>
            )}
          </div>

          <h3 className="mt-2 text-2xl font-extrabold leading-tight tracking-[-0.025em] text-ink transition-colors group-hover:text-accent-dark sm:text-3xl lg:text-[2rem]">
            {guide.title}
          </h3>

          {guide.description && (
            <p className="mt-4 line-clamp-3 max-w-md text-sm leading-6 text-secondary sm:text-base">
              {guide.description}
            </p>
          )}
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
          <span className="text-sm font-semibold text-ink">View itinerary</span>

          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-pill bg-accent-wash text-accent-dark transition-transform duration-200 group-hover:translate-x-1"
          >
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
