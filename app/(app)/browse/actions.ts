"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { loadCompletedIds, loadExperiences } from "./data";
import {
  BROWSE_SORTS,
  CATEGORIES,
  DIFFICULTIES,
  type BrowseSort,
  type ListStatus,
} from "./types";
import type { BrowseResult } from "./data";
import { UUID_RE } from "@/lib/validation";

const STATUS_VALUES = ["all", "completed", "uncompleted"] as const;
const CATEGORY_VALUES: readonly string[] = CATEGORIES;
const DIFFICULTY_VALUES: readonly string[] = DIFFICULTIES.map((d) => d.label);

export async function loadMoreExperiences(params: {
  q: string;
  category: string | null;
  difficulty: string | null;
  status: string;
  sort: string;
  cursor: string | null;
}): Promise<BrowseResult> {
  const category =
    params.category && CATEGORY_VALUES.includes(params.category)
      ? params.category
      : null;

  const difficulty =
    params.difficulty && DIFFICULTY_VALUES.includes(params.difficulty)
      ? params.difficulty
      : null;

  const status = STATUS_VALUES.includes(
    params.status as (typeof STATUS_VALUES)[number],
  )
    ? (params.status as (typeof STATUS_VALUES)[number])
    : "all";

  const sort: BrowseSort = BROWSE_SORTS.includes(params.sort as BrowseSort)
    ? (params.sort as BrowseSort)
    : "recommended";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const completedIds = user ? await loadCompletedIds(user.id) : [];

  return loadExperiences(
    {
      q: params.q.trim().slice(0, 200),
      category,
      difficulty,
      status: user ? status : "all",
      sort,
      cursor: params.cursor,
    },
    completedIds,
  );
}

function revalidateListPaths(experienceId: string) {
  revalidatePath("/browse");
  revalidatePath("/list");
  revalidatePath(`/tasks/${experienceId}`);
}

export async function setListStatus(experienceId: string, status: ListStatus) {
  if (
    !UUID_RE.test(experienceId) ||
    (status !== "saved" && status !== "completed")
  ) {
    return;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("user_lists").upsert(
    {
      user_id: user.id,
      experience_id: experienceId,
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,experience_id" },
  );

  revalidateListPaths(experienceId);
}

export async function removeFromMyList(experienceId: string) {
  if (!UUID_RE.test(experienceId)) return;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("user_lists")
    .delete()
    .eq("user_id", user.id)
    .eq("experience_id", experienceId);

  revalidateListPaths(experienceId);
}
