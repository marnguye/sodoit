"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface CreateCommentResult {
  success: boolean;
  error?: string;
}

export async function createComment(
  postId: string,
  body: string,
): Promise<CreateCommentResult> {
  const content = body.trim();

  if (!content) {
    return {
      success: false,
      error: "Comment cannot be empty.",
    };
  }

  if (content.length > 2000) {
    return {
      success: false,
      error: "Comment is too long.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You need to log in to comment.",
    };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    body: content,
  });

  if (error) {
    console.error("Failed to create comment:", error);

    return {
      success: false,
      error: "Could not post your comment.",
    };
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/feed");

  return {
    success: true,
  };
}
