import { Avatar, Card } from "@/components/ui";
import { relativeTime } from "@/lib/relative-time";
import type { AchievementActivityItem } from "@/app/(app)/feed/data";

export function AchievementActivityCard({
  item,
}: {
  item: AchievementActivityItem;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar
          name={item.actor.username}
          src={item.actor.avatarUrl}
          size="sm"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink">
              {item.actor.username}
            </span>
            <span aria-hidden="true" className="text-xs text-muted">
              ·
            </span>
            <time
              dateTime={item.timestamp}
              className="shrink-0 text-xs text-muted"
            >
              {relativeTime(item.timestamp)}
            </time>
          </div>
          <p className="mt-1 truncate text-sm text-secondary">
            unlocked{" "}
            <span className="font-semibold text-ink">
              &ldquo;{item.achievement.title}&rdquo;
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}
