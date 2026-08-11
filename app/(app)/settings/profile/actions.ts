"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteAccountData } from "@/lib/account/delete-account";
import { BIO_MAX_LENGTH, USERNAME_RE } from "@/lib/validation";
import { logger } from "@/lib/logger";

const AVATAR_PATHS = ["avatar.jpg", "avatar.png", "avatar.webp"] as const;

export interface ProfileActionResult {
  success: boolean;
  error?: string;
  url?: string;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteAccount(
  confirmation: string,
): Promise<ProfileActionResult> {
  if (confirmation !== "DELETE") {
    return {
      success: false,
      error: "Type DELETE to confirm account deletion.",
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
      error: "You must be logged in.",
    };
  }

  try {
    await deleteAccountData(createAdminClient(), user.id);
  } catch {
    return {
      success: false,
      error: "Could not delete your account. Please try again.",
    };
  }

  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}

async function getAuthenticatedProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return null;
  }

  return {
    supabase,
    user,
    username: profile.username as string | null,
  };
}

function revalidateProfilePaths(
  currentUsername: string | null,
  nextUsername?: string,
) {
  if (currentUsername) {
    revalidatePath(`/u/${currentUsername}`);
  }

  if (nextUsername && nextUsername !== currentUsername) {
    revalidatePath(`/u/${nextUsername}`);
  }

  revalidatePath("/settings/profile");
}

export async function updateProfile(input: {
  username: string;
  bio: string;
}): Promise<ProfileActionResult> {
  const context = await getAuthenticatedProfile();

  if (!context) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const { supabase, user, username: currentUsername } = context;

  const username = input.username.trim().toLowerCase();
  const bio = input.bio.trim();

  if (!USERNAME_RE.test(username)) {
    return {
      success: false,
      error:
        "Username must be 3-24 lowercase letters, numbers, underscores, or dashes.",
    };
  }

  if (bio.length > BIO_MAX_LENGTH) {
    return {
      success: false,
      error: `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`,
    };
  }

  if (username !== currentUsername) {
    const { data: existing, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();

    if (lookupError) {
      return {
        success: false,
        error: "Could not validate username.",
      };
    }

    if (existing) {
      return {
        success: false,
        error: "This username is already taken.",
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      bio: bio || null,
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: "Could not save changes. Please try again.",
    };
  }

  revalidateProfilePaths(currentUsername, username);

  return { success: true };
}

export async function updateAvatarUrl(
  avatarPath: string,
): Promise<ProfileActionResult> {
  const context = await getAuthenticatedProfile();

  if (!context) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const { supabase, user, username } = context;

  if (
    !AVATAR_PATHS.some((filename) => avatarPath === `${user.id}/${filename}`)
  ) {
    return {
      success: false,
      error: "Could not update avatar.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: "Could not update avatar.",
    };
  }

  revalidateProfilePaths(username);

  return { success: true, url: avatarUrl };
}

export async function removeAvatar(): Promise<ProfileActionResult> {
  const context = await getAuthenticatedProfile();

  if (!context) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const { supabase, user, username } = context;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (updateError) {
    return {
      success: false,
      error: "Could not remove avatar.",
    };
  }

  const paths = AVATAR_PATHS.map((filename) => `${user.id}/${filename}`);

  const { error: storageError } = await supabase.storage
    .from("avatars")
    .remove(paths);

  if (storageError) {
    logger.error("profile.avatar.cleanup_failed", {
      reason: "storage_delete_failed",
    });
  }

  revalidateProfilePaths(username);

  return { success: true };
}
