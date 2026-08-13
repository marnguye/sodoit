import type { GuideItem } from "@/lib/guides/types";
import { GuideItineraryItem } from "./GuideItineraryItem";

export function GuideItinerary({ items }: { items: GuideItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="itinerary" aria-labelledby="itinerary-heading">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 id="itinerary-heading" className="text-2xl font-bold text-ink">
          Your itinerary
        </h2>
        <p className="shrink-0 text-sm font-medium text-muted">
          {items.length} {items.length === 1 ? "stop" : "stops"}
        </p>
      </div>

      <ol className="mt-5">
        {items.map((item, index) => (
          <GuideItineraryItem
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}
