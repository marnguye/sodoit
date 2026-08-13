import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Guide } from "@/lib/guides/types";
import { GuideCover } from "./GuideCover";

export function GuideCard({
  guide,
  stopCount,
  priority = false,
}: {
  guide: Guide;
  stopCount?: number;
  priority?: boolean;
}) {
  const meta = [guide.duration_label, stopCount ? `${stopCount} stops` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group block h-full rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
    >
      <article className="flex h-full flex-col">
        <GuideCover
          imageUrl={guide.cover_image_url}
          imageAlt={guide.cover_image_alt}
          title={guide.title}
          priority={priority}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3] w-full overflow-hidden rounded-media"
        />

        <div className="flex flex-1 flex-col pt-4">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1 text-accent-dark">
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

          <h3 className="mt-2 text-lg font-extrabold leading-snug tracking-[-0.015em] text-ink transition-colors group-hover:text-accent-dark">
            {guide.title}
          </h3>

          {guide.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-secondary">
              {guide.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-sm font-semibold text-ink">
              View itinerary
            </span>

            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-pill bg-accent-wash text-accent-dark transition-transform duration-200 group-hover:translate-x-1"
            >
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
