"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loginHrefWithNext } from "@/lib/auth-redirect";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  POST_BODY_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  UUID_RE,
} from "@/lib/validation";

export interface CreatePostState {
  error?: string;
}

export async function createPost(
  _prevState: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(loginHrefWithNext("/feed/new"));
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const experienceId = String(formData.get("experienceId") ?? "").trim();

  if (
    !title ||
    title.length > POST_TITLE_MAX_LENGTH ||
    !body ||
    body.length > POST_BODY_MAX_LENGTH ||
    (experienceId && !UUID_RE.test(experienceId)) ||
    (type !== "question" && type !== "tip" && type !== "experience")
  ) {
    return { error: "Invalid post data." };
  }

  let rateLimit;

  try {
    rateLimit = await consumeRateLimit(supabase, "create_post");
  } catch {
    return { error: "Could not create post." };
  }

  if (!rateLimit.allowed) {
    return { error: "You're posting too quickly. Try again shortly." };
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
    return { error: "Could not create post." };
  }

  revalidatePath("/feed");
  redirect(`/posts/${post.id}`);
}
