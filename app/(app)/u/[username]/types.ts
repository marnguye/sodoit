import type { PostType } from "@/app/(app)/feed/types";
import type { AchievementStats } from "@/app/(app)/achievements/data";

export interface CompletedExperience {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
  image_alt: string | null;
}

export interface ProfilePost {
  id: string;
  type: PostType;
  title: string;
  body: string;
  createdAt: string;
}

export interface ProfileViewModel {
  id: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  joinedAt: string;
  completedCount: number;
  categoryCount: number;
  achievementCount: number;
  recentCompleted: CompletedExperience[];
  earnedMilestoneIds: string[];
  stats: AchievementStats;
  posts: ProfilePost[];
}
