import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ErrorState } from "@/components/ui";
import { loadProfile } from "./data";
import { loadMyList } from "@/app/(app)/list/data";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileStats } from "./components/ProfileStats";
import { ProfileNav } from "./components/ProfileNav";
import { ProfileOverview } from "./components/ProfileOverview";
import { ProfileList } from "./components/ProfileList";
import { ProfileAchievements } from "./components/ProfileAchievements";
import { ProfilePosts } from "./components/ProfilePosts";

type View = "overview" | "list" | "achievements" | "posts";

function resolveView(raw: string | undefined, isOwner: boolean): View {
  if (raw === "list") return isOwner ? "list" : "overview";
  if (raw === "achievements" || raw === "posts") return raw;
  return "overview";
}

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { username } = await params;
  const { view } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile;
  try {
    profile = await loadProfile(username);
  } catch {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState
          title="Could not load profile"
          description="Please try again shortly."
        />
      </div>
    );
  }

  if (!profile) notFound();

  const isOwner = user?.id === profile.id;
  const activeView = resolveView(view, isOwner);

  const myList = activeView === "list" ? await loadMyList(profile.id) : null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProfileHeader
            userId={profile.id}
            username={profile.username}
            bio={profile.bio}
            avatarUrl={profile.avatarUrl}
            joinedAt={profile.joinedAt}
            isOwner={isOwner}
          />
          <ProfileStats
            completed={profile.completedCount}
            categories={profile.categoryCount}
            achievements={profile.achievementCount}
          />
        </aside>

        <div className="min-w-0">
          <ProfileNav
            username={profile.username}
            active={activeView}
            showList={isOwner}
          />

          <div className="mt-6">
            {activeView === "overview" && <ProfileOverview profile={profile} />}
            {activeView === "list" && myList && (
              <ProfileList saved={myList.saved} completed={myList.completed} />
            )}
            {activeView === "achievements" && (
              <ProfileAchievements
                stats={profile.stats}
                earnedMilestoneIds={profile.earnedMilestoneIds}
              />
            )}
            {activeView === "posts" && <ProfilePosts posts={profile.posts} />}
          </div>
        </div>
      </div>
    </div>
  );
}
