import { CalendarDays } from "lucide-react";
import { Avatar } from "@/components/ui";

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileHeader({
  username,
  joinedAt,
}: {
  username: string;
  joinedAt: string;
}) {
  return (
    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
      <Avatar name={username} size="lg" />

      <h1 className="mt-4 text-2xl font-extrabold text-ink">{username}</h1>
      <p className="mt-1 text-sm text-muted">@{username}</p>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted">
        <CalendarDays className="h-3.5 w-3.5" />
        Joined {formatJoinedDate(joinedAt)}
      </div>
    </div>
  );
}
