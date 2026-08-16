import { ProfileAchievementsPreview } from "./ProfileAchievementsPreview";

export function ProfileAchievements({
  earnedMilestoneIds,
}: {
  earnedMilestoneIds: string[];
}) {
  return <ProfileAchievementsPreview earnedMilestoneIds={earnedMilestoneIds} />;
}
