import { createClient } from "@/lib/supabase/server";
import type { Experience, ListStatus } from "@/app/(app)/browse/types";

interface ListRow {
  id: string;
  status: ListStatus;
  experiences: Experience | Experience[] | null;
}

function toExperience(
  value: Experience | Experience[] | null,
): Experience | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function loadMyList(
  userId: string,
): Promise<{ saved: Experience[]; completed: Experience[] }> {
  const supabase = await createClient();

  const { data: rows } = (await supabase
    .from("user_lists")
    .select("id, status, experiences(id, title, category)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })) as { data: ListRow[] | null };

  const saved: Experience[] = [];
  const completed: Experience[] = [];

  for (const row of rows ?? []) {
    const experience = toExperience(row.experiences);
    if (!experience) continue;
    if (row.status === "saved") saved.push(experience);
    else if (row.status === "completed") completed.push(experience);
  }

  return { saved, completed };
}
