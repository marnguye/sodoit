import { MILESTONES } from "@/app/(app)/achievements/data";
import { Card, EmptyState } from "@/components/ui";

const PREVIEW_COUNT = 4;

interface ProfileAchievementsPreviewProps {
  earnedMilestoneIds: string[];
}

export function ProfileAchievementsPreview({
  earnedMilestoneIds,
}: ProfileAchievementsPreviewProps) {
  const earnedIds = new Set(earnedMilestoneIds);

  const milestones = MILESTONES.filter((milestone) =>
    earnedIds.has(milestone.id),
  ).slice(0, PREVIEW_COUNT);

  if (milestones.length === 0) {
    return <EmptyState title="No achievements earned yet" />;
  }

  return (
    <Card className="p-0">
      <ul className="divide-y divide-border">
        {milestones.map((milestone) => {
          const Icon = milestone.icon;

          return (
            <li
              key={milestone.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent-dark">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  {milestone.title}
                </p>

                <p className="mt-0.5 truncate text-xs text-muted">
                  {milestone.description}
                </p>
              </div>

              <span className="text-[11px] font-semibold text-accent-dark">
                Earned
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
