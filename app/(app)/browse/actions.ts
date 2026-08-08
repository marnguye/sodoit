"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ListStatus } from "./types";

function revalidateListPaths(experienceId: string) {
  revalidatePath("/browse");
  revalidatePath("/list");
  revalidatePath(`/tasks/${experienceId}`);
}

export async function setListStatus(experienceId: string, status: ListStatus) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("user_lists")
    .upsert(
      { user_id: user.id, experience_id: experienceId, status },
      { onConflict: "user_id,experience_id" },
    );

  revalidateListPaths(experienceId);
}

export async function removeFromMyList(experienceId: string) {
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
