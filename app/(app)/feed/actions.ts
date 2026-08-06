"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function createPost(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const experienceId = String(formData.get("experienceId") ?? "").trim();

  if (
    !title ||
    !body ||
    (type !== "question" && type !== "tip" && type !== "experience")
  ) {
    throw new Error("Invalid post data.");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      body,
      type,
      experience_id: experienceId || null,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !post) {
    throw new Error("Could not create post.");
  }

  revalidatePath("/feed");
  redirect(`/posts/${post.id}`);
}
