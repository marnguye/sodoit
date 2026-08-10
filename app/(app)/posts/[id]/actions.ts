"use server";

import { revalidatePath } from "next/cache";
import { consumeRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { COMMENT_MAX_LENGTH, UUID_RE } from "@/lib/validation";

interface CreateCommentResult {
  success: boolean;
  error?: string;
}

export async function createComment(
  postId: string,
  body: string,
): Promise<CreateCommentResult> {
  const content = body.trim();

  if (!UUID_RE.test(postId)) {
    return {
      success: false,
      error: "Could not post your comment.",
    };
  }

  if (!content) {
    return {
      success: false,
      error: "Comment cannot be empty.",
    };
  }

  if (content.length > COMMENT_MAX_LENGTH) {
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

  let rateLimit;

  try {
    rateLimit = await consumeRateLimit(supabase, "create_comment");
  } catch {
    return {
      success: false,
      error: "Could not post your comment.",
    };
  }

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: "You're commenting too quickly. Try again shortly.",
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
