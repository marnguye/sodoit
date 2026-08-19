import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar, Card } from "@/components/ui";
import { relativeTime } from "@/lib/relative-time";
import type { CollectionActivityItem } from "@/app/(app)/feed/data";

export function CollectionActivityCard({
  item,
}: {
  item: CollectionActivityItem;
}) {
  return (
    <Card className="p-4">
      <Link
        href={`/u/${item.collection.ownerUsername}/collections/${item.collection.slug}`}
        className="flex items-center gap-3"
      >
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
            created a collection:{" "}
            <span className="font-semibold text-ink">
              {item.collection.name}
            </span>
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent-dark">
          View collection
          <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
      </Link>
    </Card>
  );
}
