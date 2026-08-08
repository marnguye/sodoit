import { MILESTONES } from "@/app/(app)/achievements/data";
import type { AchievementStats } from "@/app/(app)/achievements/data";
import { MilestoneCard } from "@/app/(app)/achievements/components/MilestoneCard";

export function ProfileAchievements({
  stats,
  earnedMilestoneIds,
}: {
  stats: AchievementStats;
  earnedMilestoneIds: string[];
}) {
  const earnedSet = new Set(earnedMilestoneIds);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {MILESTONES.map((milestone) => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          current={milestone.progress(stats)}
          earned={earnedSet.has(milestone.id)}
        />
      ))}
    </div>
  );
}
