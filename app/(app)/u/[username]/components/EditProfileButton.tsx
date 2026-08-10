"use client";

import { useState } from "react";
import { ProfileEditModal } from "./ProfileEditModal";

interface EditProfileButtonProps {
  userId: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
}

export function EditProfileButton({
  userId,
  username,
  bio,
  avatarUrl,
}: EditProfileButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-border/30"
      >
        Edit profile
      </button>

      <ProfileEditModal
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        username={username}
        bio={bio}
        avatarUrl={avatarUrl}
      />
    </>
  );
}
