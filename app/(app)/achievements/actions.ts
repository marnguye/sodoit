"use server";

import { createClient } from "@/utils/supabase/server";
import { MILESTONES, type AchievementStats } from "./data";

interface ExperienceRow {
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

function buildAchievementStats(
  completedRows: CompletedRow[],
): AchievementStats {
  const categoriesCompleted = new Set<string>();
  const completedByCategory = new Map<string, number>();

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

  return {
    totalCompleted,
    categoriesCompleted,
    completedByCategory,
  };
}

function getUnlockedAchievementIds(stats: AchievementStats): string[] {
  return MILESTONES.filter(
    (milestone) => milestone.progress(stats) >= milestone.target,
  ).map((milestone) => milestone.id);
}

export async function checkAndUnlockAchievements(): Promise<string[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  /*
   * 1. Load all currently completed experiences.
   */
  const { data: completedRows, error: completedError } = await supabase
    .from("user_lists")
    .select("experiences(category)")
    .eq("user_id", user.id)
    .eq("status", "completed");

  if (completedError) {
    console.error("Failed to load completed experiences:", completedError);

    return [];
  }

  /*
   * 2. Calculate current achievement progress.
   */
  const stats = buildAchievementStats((completedRows ?? []) as CompletedRow[]);

  /*
   * 3. Find every achievement whose condition is currently satisfied.
   */
  const unlockedIds = getUnlockedAchievementIds(stats);

  if (unlockedIds.length === 0) {
    return [];
  }

  /*
   * 4. Check which achievements were already earned.
   *
   * user_achievements is permanent history.
   * We never remove rows when a task becomes incomplete again.
   */
  const { data: earnedAchievements, error: earnedError } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", user.id)
    .in("achievement_id", unlockedIds);

  if (earnedError) {
    console.error("Failed to load earned achievements:", earnedError);

    return [];
  }

  const earnedIds = new Set(
    ((earnedAchievements ?? []) as EarnedAchievementRow[]).map(
      (achievement) => achievement.achievement_id,
    ),
  );

  /*
   * 5. Only these achievements should trigger a popup.
   */
  const newlyUnlocked = unlockedIds.filter(
    (achievementId) => !earnedIds.has(achievementId),
  );

  if (newlyUnlocked.length === 0) {
    return [];
  }

  /*
   * 6. Persist new achievements permanently.
   *
   * DB should have:
   * PRIMARY KEY (user_id, achievement_id)
   */
  const { error: insertError } = await supabase
    .from("user_achievements")
    .insert(
      newlyUnlocked.map((achievementId) => ({
        user_id: user.id,
        achievement_id: achievementId,
      })),
    );

  if (insertError) {
    console.error("Failed to save unlocked achievements:", insertError);

    return [];
  }

  /*
   * Only newly earned achievements are returned.
   * The frontend uses this array for the popup queue.
   */
  return newlyUnlocked;
}
