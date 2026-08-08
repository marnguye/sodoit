import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Card, EmptyState } from "@/components/ui";
import { getTaskMeta } from "@/app/(app)/browse/types";
import { getCategoryAccent } from "@/app/(app)/achievements/data";

import type { CompletedExperience } from "../types";

interface RecentCompletedProps {
  experiences: CompletedExperience[];
}

const PREVIEW_COUNT = 5;

export function RecentCompleted({ experiences }: RecentCompletedProps) {
  if (experiences.length === 0) {
    return (
      <EmptyState
        title="Nothing completed yet"
        description="Completed experiences will appear here."
      />
    );
  }

  const recentExperiences = experiences?.slice(0, PREVIEW_COUNT);

  return (
    <Card className="p-0">
      <ul className="divide-y divide-border">
        {recentExperiences.map((experience) => (
          <ExperienceRow key={experience.id} experience={experience} />
        ))}
      </ul>
    </Card>
  );
}

function ExperienceRow({ experience }: { experience: CompletedExperience }) {
  const meta = getTaskMeta(experience.id);

  return (
    <li>
      <Link
        href={`/tasks/${experience.id}`}
        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-background"
      >
        <span
          aria-hidden="true"
          className="h-10 w-10 shrink-0 rounded-lg"
          style={{ backgroundColor: meta.thumbnail }}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-accent-dark">
            {experience.title}
          </p>

          {experience.category && (
            <div className="mt-1 flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: getCategoryAccent(experience.category),
                }}
              />

              <span className="text-xs text-muted">{experience.category}</span>
            </div>
          )}
        </div>

        <ChevronRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-border transition-colors group-hover:text-muted"
        />
      </Link>
    </li>
  );
}
