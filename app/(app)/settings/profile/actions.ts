"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const USERNAME_RE = /^[a-z0-9_-]{3,24}$/;
const BIO_MAX_LENGTH = 160;

const AVATAR_PATHS = ["avatar.jpg", "avatar.png", "avatar.webp"] as const;

export interface ProfileActionResult {
  success: boolean;
  error?: string;
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
  avatarUrl: string,
): Promise<ProfileActionResult> {
  const context = await getAuthenticatedProfile();

  if (!context) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const { supabase, user, username } = context;

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

  return { success: true };
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
    console.error("Failed to remove avatar files:", storageError);
  }

  revalidateProfilePaths(username);

  return { success: true };
}
