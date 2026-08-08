import { MyListBoard } from "@/app/(app)/list/MyListBoard";
import type { Experience } from "@/app/(app)/browse/types";

export function ProfileList({
  saved,
  completed,
}: {
  saved: Experience[];
  completed: Experience[];
}) {
  return <MyListBoard saved={saved} completed={completed} />;
}
