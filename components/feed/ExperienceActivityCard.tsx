import Link from "next/link";
import { Avatar, Card, ExperienceImage } from "@/components/ui";
import { relativeTime } from "@/app/(app)/feed/types";
import type { ExperienceActivityItem } from "@/app/(app)/feed/data";
import { AddToListButton } from "./AddToListButton";

const FALLBACK_COLORS = ["#FED7AA", "#BAE6FD", "#BBF7D0", "#E9D5FF", "#FECACA"];

function fallbackColorFor(id: string) {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

interface ExperienceActivityCardProps {
  item: ExperienceActivityItem;
  viewerStatus: "saved" | "completed" | null;
  signedIn: boolean;
}

const ACTION_TEXT: Record<ExperienceActivityItem["kind"], string> = {
  completed: "completed",
  added_to_list: "added to their list",
};

export function ExperienceActivityCard({
  item,
  viewerStatus,
  signedIn,
}: ExperienceActivityCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Avatar
          name={item.actor.username}
          src={item.actor.avatarUrl}
          size="sm"
        />
        <span className="truncate text-sm font-semibold text-ink">
          {item.actor.username}
        </span>
        <span aria-hidden="true" className="text-xs text-muted">
          ·
        </span>
        <time dateTime={item.timestamp} className="shrink-0 text-xs text-muted">
          {relativeTime(item.timestamp)}
        </time>
      </div>

      <p className="mt-2 text-sm text-secondary">
        {ACTION_TEXT[item.kind]}{" "}
        <Link
          href={`/tasks/${item.experience.id}`}
          className="font-semibold text-ink hover:text-accent-dark"
        >
          {item.experience.title}
        </Link>
      </p>

      <div className="mt-3 flex items-center gap-3 rounded-control bg-background p-2.5">
        <ExperienceImage
          imageUrl={item.experience.imageUrl}
          imageAlt={item.experience.imageAlt}
          title={item.experience.title}
          fallbackColor={fallbackColorFor(item.experience.id)}
          className="h-12 w-12 shrink-0 rounded-md"
          sizes="48px"
        />

        <div className="min-w-0 flex-1">
          <Link
            href={`/tasks/${item.experience.id}`}
            className="block truncate text-sm font-semibold text-ink hover:text-accent-dark"
          >
            {item.experience.title}
          </Link>
          <p className="truncate text-xs text-muted">
            {item.experience.category ?? "Experience"}
            {item.experience.difficulty
              ? ` · ${item.experience.difficulty}`
              : ""}
          </p>
        </div>

        <AddToListButton
          experienceId={item.experience.id}
          initialStatus={viewerStatus}
          signedIn={signedIn}
        />
      </div>
    </Card>
  );
}
