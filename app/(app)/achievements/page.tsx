import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginHrefWithNext } from "@/lib/auth-redirect";
import { PageShell, Card, ErrorState } from "@/components/ui";
import { getAchievementProgress, type AchievementStats } from "./data";
import { loadAchievementDefinitions } from "./queries";
import { MilestoneCard } from "./components/MilestoneCard";

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
              href={loginHrefWithNext("/achievements")}
              className="font-semibold text-accent hover:text-accent-dark"
            >
              Log in →
            </Link>
          </p>
        </Card>
      </PageShell>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.username) {
    redirect(`/u/${profile.username}?view=achievements`);
  }

  const [completedResult, earnedAchievementsResult, definitions] =
    await Promise.all([
      supabase
        .from("user_lists")
        .select("experiences(id, category)")
        .eq("user_id", user.id)
        .eq("status", "completed"),

      supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id),
      loadAchievementDefinitions(),
    ]);

  if (completedResult.error || earnedAchievementsResult.error) {
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

  const completedRows = (completedResult.data ?? []) as CompletedRow[];

  const earnedAchievements = (earnedAchievementsResult.data ??
    []) as EarnedAchievementRow[];

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

  const groups = [
    ...new Set(definitions.map((definition) => definition.group)),
  ];

  return (
    <PageShell
      title="Achievements"
      subtitle="Milestones from the experiences you've completed."
    >
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-sm font-bold text-ink">Your collection</h2>
          <div className="mt-4 flex flex-col gap-8">
            {groups.map((group) => (
              <div key={group}>
                <h3 className="text-sm font-semibold text-ink">{group}</h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {definitions
                    .filter((definition) => definition.group === group)
                    .map((definition) => (
                      <MilestoneCard
                        key={definition.id}
                        milestone={definition}
                        current={getAchievementProgress(definition, stats)}
                        earned={earnedAchievementIds.has(definition.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
