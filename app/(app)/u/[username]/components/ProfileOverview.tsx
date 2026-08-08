import { RecentCompleted } from "./RecentCompleted";
import { ProfileAchievementsPreview } from "./ProfileAchievementsPreview";
import { ProfilePosts } from "./ProfilePosts";
import type { ProfileViewModel } from "../types";

const POSTS_PREVIEW_COUNT = 3;

export function ProfileOverview({ profile }: { profile: ProfileViewModel }) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-sm font-bold text-ink">Recently completed</h2>

        <div className="mt-3">
          <RecentCompleted experiences={profile.recentCompleted} />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-sm font-bold text-ink">Achievements</h2>

          <div className="mt-3">
            <ProfileAchievementsPreview
              earnedMilestoneIds={profile.earnedMilestoneIds}
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-ink">Community posts</h2>

          <div className="mt-3">
            <ProfilePosts posts={profile.posts.slice(0, POSTS_PREVIEW_COUNT)} />
          </div>
        </section>
      </div>
    </div>
  );
}
