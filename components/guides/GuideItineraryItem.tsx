import { ExternalLink } from "lucide-react";
import type { GuideItem } from "@/lib/guides/types";
import { GuideCover } from "./GuideCover";

interface GuideItineraryItemProps {
  item: GuideItem;
  isLast: boolean;
}

export function GuideItineraryItem({ item, isLast }: GuideItineraryItemProps) {
  const showPlaceName =
    item.place_name &&
    item.place_name.trim().toLocaleLowerCase() !==
      item.title.trim().toLocaleLowerCase();

  return (
    <li className="relative flex gap-3 pb-6 last:pb-0 sm:gap-4">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-[15px] top-8 w-px bg-border"
        />
      )}

      <span
        aria-hidden="true"
        className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white"
      >
        {String(item.position + 1).padStart(2, "0")}
      </span>

      <article
        className={`min-w-0 flex-1 border-b border-border pb-6 ${
          item.image_url ? "grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]" : ""
        }`}
      >
        {item.image_url && (
          <GuideCover
            imageUrl={item.image_url}
            imageAlt={item.image_alt}
            title={item.title}
            sizes="(min-width: 768px) 160px, calc(100vw - 68px)"
            className="order-2 h-40 w-full rounded-xl md:order-1 md:h-[120px] md:w-40"
          />
        )}

        <div className="min-w-0 md:order-2">
          <h3 className="text-lg font-bold leading-snug text-ink sm:text-xl">
            {item.title}
          </h3>

          {showPlaceName && (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              {item.place_name}
            </p>
          )}

          {item.description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              {item.description}
            </p>
          )}

          {item.external_url && (
            <a
              href={item.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-accent-dark underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`View ${item.title} (opens in a new tab)`}
            >
              View place
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </article>
    </li>
  );
}
