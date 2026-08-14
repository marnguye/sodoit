import type { GuideItem } from "@/lib/guides/types";
import { GuideItineraryItem } from "./GuideItineraryItem";

// Heading + anchor live in the page (it owns the eyebrow/title/count
// pattern shared across itinerary and collection framing) — this just
// renders the timeline.
export function GuideItinerary({ items }: { items: GuideItem[] }) {
  if (items.length === 0) return null;

  return (
    <ol>
      {items.map((item, index) => (
        <GuideItineraryItem
          key={item.id}
          item={item}
          isLast={index === items.length - 1}
        />
      ))}
    </ol>
  );
}
