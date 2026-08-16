import { createElement } from "react";
import { Card, EmptyState } from "@/components/ui";
import {
  getAchievementIcon,
  getAchievementProgress,
  type AchievementDefinition,
  type AchievementStats,
} from "@/app/(app)/achievements/data";

export function ProfileAchievements({
  earnedMilestoneIds,
  achievements,
  stats,
}: {
  earnedMilestoneIds: string[];
  achievements: AchievementDefinition[];
  stats: AchievementStats;
}) {
  if (achievements.length === 0) {
    return <EmptyState title="No achievements available yet" />;
  }

  const earnedIds = new Set(earnedMilestoneIds);
  const groups = [] as {
    name: string;
    achievements: AchievementDefinition[];
  }[];
  const byGroup = new Map<string, AchievementDefinition[]>();

  for (const achievement of achievements) {
    const group = byGroup.get(achievement.group) ?? [];
    group.push(achievement);
    byGroup.set(achievement.group, group);
  }

  for (const [name, groupAchievements] of byGroup) {
    groups.push({
      name,
      achievements: [...groupAchievements].sort(
        (left, right) => left.sortOrder - right.sortOrder,
      ),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.name}>
          <h2 className="text-sm font-bold text-ink">{group.name}</h2>
          <Card className="mt-3 p-0">
            <ul className="divide-y divide-border">
              {group.achievements.map((achievement) => {
                const earned = earnedIds.has(achievement.id);
                const current = Math.min(
                  getAchievementProgress(achievement, stats),
                  achievement.target,
                );
                const Icon = getAchievementIcon(achievement.icon);
                const progressLabel =
                  achievement.ruleType === "categories_completed"
                    ? `${current} / ${achievement.target} categories`
                    : `${current} / ${achievement.target}`;

                return (
                  <li
                    key={achievement.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      earned ? "bg-accent-wash" : ""
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                        earned
                          ? "border-accent/40 bg-accent-light text-accent-dark"
                          : "border-border bg-background text-muted"
                      }`}
                    >
                      {createElement(Icon, { className: "h-5 w-5" })}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p
                          className={`text-sm font-semibold ${
                            earned ? "text-ink" : "text-muted"
                          }`}
                        >
                          {achievement.title}
                        </p>
                        <span
                          className={`text-[11px] font-semibold ${
                            earned ? "text-accent-dark" : "text-muted"
                          }`}
                        >
                          {earned ? "Earned" : "Locked"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">
                        {achievement.description}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs font-semibold text-muted">
                      {progressLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      ))}
    </div>
  );
}
