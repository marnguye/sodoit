import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageShell, Card, ErrorState } from "@/components/ui";
import {
  MILESTONES,
  getCategoryIcon,
  getCategoryAccent,
  type AchievementStats,
} from "./data";
import { MilestoneCard } from "./components/MilestoneCard";
import { CategoryRow } from "./components/CategoryRow";

interface ExperienceRow {
  id: string;
  category: string | null;
}

interface CompletedRow {
  experiences: ExperienceRow | ExperienceRow[] | null;
}

interface EarnedAchievementRow {
  achievement_id: string;
}

function toSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function AchievementsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <PageShell
        title="Achievements"
        subtitle="A look at what you've accomplished so far."
      >
        <Card className="py-12 text-center">
          <p className="text-sm text-muted">
            Log in to see your achievements.{" "}
            <Link
              href="/login"
              className="font-semibold text-accent hover:text-accent-dark"
            >
              Log in →
            </Link>
          </p>
        </Card>
      </PageShell>
    );
  }

  const [experiencesResult, completedResult, earnedAchievementsResult] =
    await Promise.all([
      supabase.from("experiences").select("id, category"),

      supabase
        .from("user_lists")
        .select("experiences(id, category)")
        .eq("user_id", user.id)
        .eq("status", "completed"),

      supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id),
    ]);

  if (
    experiencesResult.error ||
    completedResult.error ||
    earnedAchievementsResult.error
  ) {
    return (
      <PageShell
        title="Achievements"
        subtitle="A look at what you've accomplished so far."
      >
        <ErrorState
          title="Could not load achievements"
          description="Something went wrong while loading your progress."
        />
      </PageShell>
    );
  }

  const experiences = (experiencesResult.data ?? []) as ExperienceRow[];

  const completedRows = (completedResult.data ?? []) as CompletedRow[];

  const earnedAchievements = (earnedAchievementsResult.data ??
    []) as EarnedAchievementRow[];

  const categoryTotals = new Map<string, number>();

  for (const experience of experiences) {
    if (!experience.category) {
      continue;
    }

    categoryTotals.set(
      experience.category,
      (categoryTotals.get(experience.category) ?? 0) + 1,
    );
  }

  const completedByCategory = new Map<string, number>();
  const categoriesCompleted = new Set<string>();

  let totalCompleted = 0;

  for (const row of completedRows) {
    const experience = toSingle(row.experiences);

    if (!experience) {
      continue;
    }

    totalCompleted += 1;

    if (!experience.category) {
      continue;
    }

    categoriesCompleted.add(experience.category);

    completedByCategory.set(
      experience.category,
      (completedByCategory.get(experience.category) ?? 0) + 1,
    );
  }

  const stats: AchievementStats = {
    totalCompleted,
    categoriesCompleted,
    completedByCategory,
  };

  const earnedAchievementIds = new Set(
    earnedAchievements.map((achievement) => achievement.achievement_id),
  );

  const earnedCount = MILESTONES.filter((milestone) =>
    earnedAchievementIds.has(milestone.id),
  ).length;

  const categories = [...categoryTotals.keys()].sort();

  return (
    <PageShell
      title="Achievements"
      subtitle="A look at what you've accomplished so far."
    >
      <div className="flex flex-col gap-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="flex flex-col justify-center gap-1 border-accent/30 py-8">
            <p className="text-3xl font-extrabold text-accent">
              {totalCompleted}
            </p>
            <p className="text-sm text-muted">Experiences completed</p>
          </Card>

          <Card className="flex flex-col justify-center gap-1 py-8">
            <p className="text-2xl font-extrabold text-ink">
              {categoriesCompleted.size}
            </p>
            <p className="text-sm text-muted">Categories explored</p>
          </Card>

          <Card className="flex flex-col justify-center gap-1 py-8">
            <p className="text-2xl font-extrabold text-ink">
              {earnedCount} / {MILESTONES.length}
            </p>
            <p className="text-sm text-muted">Achievements earned</p>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-bold text-ink">Milestones</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MILESTONES.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                current={milestone.progress(stats)}
                earned={earnedAchievementIds.has(milestone.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-ink">Category progress</h2>

          <Card className="mt-4">
            {categories.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                No categories yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {categories.map((category) => (
                  <CategoryRow
                    key={category}
                    icon={getCategoryIcon(category)}
                    accent={getCategoryAccent(category)}
                    name={category}
                    completed={completedByCategory.get(category) ?? 0}
                    total={categoryTotals.get(category) ?? 0}
                  />
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>
    </PageShell>
  );
}
