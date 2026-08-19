import type { ActivityItem } from "@/app/(app)/feed/data";
import { ExperienceActivityCard } from "./ExperienceActivityCard";
import { CollectionActivityCard } from "./CollectionActivityCard";
import { AchievementActivityCard } from "./AchievementActivityCard";

interface ActivityListItemProps {
  item: ActivityItem;
  viewerStatus: "saved" | "completed" | null;
  signedIn: boolean;
}

export function ActivityListItem({
  item,
  viewerStatus,
  signedIn,
}: ActivityListItemProps) {
  if (item.kind === "completed" || item.kind === "added_to_list") {
    return (
      <ExperienceActivityCard
        item={item}
        viewerStatus={viewerStatus}
        signedIn={signedIn}
      />
    );
  }

  if (item.kind === "collection_created") {
    return <CollectionActivityCard item={item} />;
  }

  if (item.kind === "achievement_unlocked") {
    return <AchievementActivityCard item={item} />;
  }

  return null;
}
