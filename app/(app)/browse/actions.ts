"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function addToList(experienceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("user_lists")
    .insert({ user_id: user.id, experience_id: experienceId });

  revalidatePath("/browse");
  revalidatePath("/app");
}

export async function removeFromList(experienceId: string) {
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

  revalidatePath("/browse");
  revalidatePath("/app");
}
