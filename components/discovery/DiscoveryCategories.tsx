import Link from "next/link";
import {
  Sparkles,
  Map,
  UtensilsCrossed,
  Trees,
  Users,
  Gem,
} from "lucide-react";

import { discoveryUrl } from "@/lib/discovery/url";

export const DISCOVERY_CATEGORIES = [
  { slug: "for-you", label: "For You", icon: Sparkles },
  { slug: "itineraries", label: "Itineraries", icon: Map },
  { slug: "food", label: "Food & Drink", icon: UtensilsCrossed },
  { slug: "outdoors", label: "Outdoors", icon: Trees },
  { slug: "kids", label: "With Kids", icon: Users },
  { slug: "hidden-gems", label: "Hidden Gems", icon: Gem },
] as const;

export type DiscoveryCategorySlug =
  (typeof DISCOVERY_CATEGORIES)[number]["slug"];

interface DiscoveryCategoriesProps {
  city: string | null;
  activeCategory: DiscoveryCategorySlug | null;
}

export function DiscoveryCategories({
  city,
  activeCategory,
}: DiscoveryCategoriesProps) {
  return (
    <nav
      aria-label="Discovery categories"
      className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
    >
      <div className="flex w-max items-center gap-1">
        {DISCOVERY_CATEGORIES.map(({ slug, label, icon: Icon }) => {
          const active =
            activeCategory === slug || (!activeCategory && slug === "for-you");

          return (
            <Link
              key={slug}
              href={discoveryUrl({
                city: city ?? undefined,
                category: slug === "for-you" ? undefined : slug,
              })}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-flex h-8 shrink-0 items-center gap-1.5",
                "rounded-control border px-3.5",
                "text-xs font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                active
                  ? "border-accent/40 bg-accent-wash text-accent-dark"
                  : "border-border bg-surface text-secondary hover:border-border-strong hover:text-ink",
              ].join(" ")}
            >
              <Icon
                aria-hidden="true"
                className="h-3.5 w-3.5"
                strokeWidth={2}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
