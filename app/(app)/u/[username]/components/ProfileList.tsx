import { MyListBoard } from "@/app/(app)/list/MyListBoard";
import { PublicListView } from "@/app/(app)/u/[username]/list/PublicListView";
import type { Experience } from "@/app/(app)/browse/types";

export function ProfileList({
  username,
  isOwner,
  saved,
  completed,
}: {
  username: string;
  isOwner: boolean;
  saved: Experience[];
  completed: Experience[];
}) {
  if (!isOwner) {
    return (
      <PublicListView
        username={username}
        isOwner={false}
        saved={saved}
        completed={completed}
      />
    );
  }
  return <MyListBoard saved={saved} completed={completed} />;
}
