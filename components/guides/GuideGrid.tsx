import type { Guide } from "@/lib/guides/types";
import { GuideCard } from "./GuideCard";

interface GuideGridProps {
  title: string;
  guides: Guide[];
  eyebrow?: string;
  stopCounts?: Record<string, number>;
}

export function GuideGrid({
  title,
  guides,
  eyebrow,
  stopCounts,
}: GuideGridProps) {
  if (guides.length === 0) return null;

  return (
    <section>
      <div className="mb-4">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <GuideCard
            key={guide.id}
            guide={guide}
            stopCount={stopCounts?.[guide.id]}
          />
        ))}
      </div>
    </section>
  );
}
