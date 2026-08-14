import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Guide } from "@/lib/guides/types";
import { GuideCover } from "@/components/guides/GuideCover";

export function DiscoveryCard({
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

        <div className="flex flex-1 flex-col pt-3.5">
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

          <h3 className="mt-1.5 text-base font-extrabold leading-snug tracking-[-0.01em] text-ink transition-colors group-hover:text-accent-dark">
            {guide.title}
          </h3>

          {guide.description && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-secondary">
              {guide.description}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
