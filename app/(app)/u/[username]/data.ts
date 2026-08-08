import { createClient } from "@/lib/supabase/server";
import { MILESTONES } from "@/app/(app)/achievements/data";
import type { AchievementStats } from "@/app/(app)/achievements/data";
import type { PostType } from "@/app/(app)/feed/types";
import type { ProfileViewModel } from "./types";

const POSTS_LIMIT = 20;

interface ProfileRow {
  id: string;
  username: string | null;
  created_at: string;
}

interface ExperienceRow {
  id: string;
  title: string;
  category: string | null;
}

interface CompletedRow {
  experiences: ExperienceRow | ExperienceRow[] | null;
}

interface AchievementRow {
  achievement_id: string;
}

interface PostRow {
  id: string;
  type: PostType;
  title: string;
  body: string;
  created_at: string;
}

function toSingle<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function loadProfile(
  username: string,
): Promise<ProfileViewModel | null> {
  const supabase = await createClient();

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, created_at")
    .eq("username", username)
    .maybeSingle();

  if (profileError) throw new Error("Could not load profile.");
  if (!profileData) return null;

  const profile = profileData as ProfileRow;

  const [completedResult, achievementsResult, postsResult] = await Promise.all([
    supabase
      .from("user_lists")
      .select("experiences(id, title, category)")
      .eq("user_id", profile.id)
      .eq("status", "completed"),

    supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", profile.id),

    supabase
      .from("posts")
      .select("id, type, title, body, created_at")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(POSTS_LIMIT),
  ]);

  if (completedResult.error || achievementsResult.error || postsResult.error) {
    throw new Error("Could not load profile.");
  }

  const completedRows = (completedResult.data ?? []) as CompletedRow[];
  const achievementRows = (achievementsResult.data ?? []) as AchievementRow[];
  const postRows = (postsResult.data ?? []) as PostRow[];

  const completedExperiences = completedRows
    .map((row) => toSingle(row.experiences))
    .filter((experience): experience is ExperienceRow => experience !== null);

  const completedByCategory = new Map<string, number>();
  const categoriesCompleted = new Set<string>();

  for (const experience of completedExperiences) {
    if (!experience.category) continue;
    categoriesCompleted.add(experience.category);
    completedByCategory.set(
      experience.category,
      (completedByCategory.get(experience.category) ?? 0) + 1,
    );
  }

  const stats: AchievementStats = {
    totalCompleted: completedExperiences.length,
    categoriesCompleted,
    completedByCategory,
  };

  const earnedMilestoneIds = achievementRows.map((row) => row.achievement_id);

  return {
    id: profile.id,
    username: profile.username ?? "User",
    joinedAt: profile.created_at,
    completedCount: completedExperiences.length,
    categoryCount: categoriesCompleted.size,
    achievementCount: MILESTONES.filter((milestone) =>
      earnedMilestoneIds.includes(milestone.id),
    ).length,
    recentCompleted: completedExperiences.slice(0, 5).map((experience) => ({
      id: experience.id,
      title: experience.title,
      category: experience.category,
    })),
    earnedMilestoneIds,
    stats,
    posts: postRows.map((post) => ({
      id: post.id,
      type: post.type,
      title: post.title,
      body: post.body,
      createdAt: post.created_at,
    })),
  };
}
