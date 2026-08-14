import type { Guide } from "@/lib/guides/types";
import { DiscoveryCard } from "./DiscoveryCard";

interface DiscoveryGridProps {
  title: string;
  guides: Guide[];
  eyebrow?: string;
  stopCounts?: Record<string, number>;
}

export function DiscoveryGrid({
  title,
  guides,
  eyebrow,
  stopCounts,
}: DiscoveryGridProps) {
  if (guides.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {eyebrow}
            </p>
          )}

          <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {title}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <DiscoveryCard
            key={guide.id}
            guide={guide}
            stopCount={stopCounts?.[guide.id]}
          />
        ))}
      </div>
    </section>
  );
}
