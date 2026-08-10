import { CalendarDays } from "lucide-react";
import { Avatar } from "@/components/ui";
import { EditProfileButton } from "./EditProfileButton";
import { signOut } from "@/app/(app)/settings/profile/actions";

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileHeader({
  userId,
  username,
  bio,
  avatarUrl,
  joinedAt,
  isOwner,
}: {
  userId: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  joinedAt: string;
  isOwner: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
      <Avatar name={username} src={avatarUrl} size="lg" />

      <h1 className="mt-4 text-2xl font-extrabold text-ink">{username}</h1>
      <p className="mt-1 text-sm text-muted">@{username}</p>

      {bio && <p className="mt-2 text-sm text-ink leading-relaxed">{bio}</p>}

      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted">
        <CalendarDays className="h-3.5 w-3.5" />
        Joined {formatJoinedDate(joinedAt)}
      </div>

      {isOwner && (
        <div className="mt-4 flex items-center gap-2">
          <EditProfileButton
            userId={userId}
            username={username}
            bio={bio ?? ""}
            avatarUrl={avatarUrl}
          />

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
