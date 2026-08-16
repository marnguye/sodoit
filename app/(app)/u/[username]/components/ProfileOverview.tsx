import Link from "next/link";
import { RecentCompleted } from "./RecentCompleted";
import { ProfileAchievementsPreview } from "./ProfileAchievementsPreview";
import { ProfilePosts } from "./ProfilePosts";
import { ProfileCollections } from "./ProfileCollections";
import type { ProfileViewModel } from "../types";
import type { Collection } from "@/app/(app)/list/collections/types";

const POSTS_PREVIEW_COUNT = 3;

export function ProfileOverview({
  profile,
  collections,
  isOwner,
}: {
  profile: ProfileViewModel;
  collections: Collection[];
  isOwner: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-ink">Recently completed</h2>
          {profile.recentCompleted.length > 0 && (
            <Link
              href={`/u/${profile.username}?view=list`}
              className="text-xs font-semibold text-accent-dark hover:text-accent"
            >
              View all
            </Link>
          )}
        </div>

        <div className="mt-3">
          <RecentCompleted experiences={profile.recentCompleted} />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-ink">Achievements</h2>
            {profile.achievementCount > 0 && (
              <Link
                href={`/u/${profile.username}?view=achievements`}
                className="text-xs font-semibold text-accent-dark hover:text-accent"
              >
                View all
              </Link>
            )}
          </div>

          <div className="mt-3">
            <ProfileAchievementsPreview
              earnedMilestoneIds={profile.earnedMilestoneIds}
              limit={4}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-ink">Community posts</h2>
            {profile.posts.length > 0 && (
              <Link
                href={`/u/${profile.username}?view=posts`}
                className="text-xs font-semibold text-accent-dark hover:text-accent"
              >
                View all
              </Link>
            )}
          </div>

          <div className="mt-3">
            <ProfilePosts posts={profile.posts.slice(0, POSTS_PREVIEW_COUNT)} />
          </div>
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-ink">Collections</h2>
          {isOwner && (
            <Link
              href="/list"
              className="text-xs font-semibold text-accent-dark hover:text-accent"
            >
              Manage
            </Link>
          )}
        </div>

        <div className="mt-3">
          <ProfileCollections
            username={profile.username}
            collections={collections}
            isOwner={isOwner}
          />
        </div>
      </section>
    </div>
  );
}
