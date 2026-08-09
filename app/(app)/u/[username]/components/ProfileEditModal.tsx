"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ProfileForm } from "@/app/(app)/settings/profile/components/ProfileForm";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
}

export function ProfileEditModal({
  open,
  onClose,
  userId,
  username,
  bio,
  avatarUrl,
}: ProfileEditModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/15 p-4"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-extrabold text-ink">Edit profile</h2>

        <div className="mt-5">
          <ProfileForm
            bare
            userId={userId}
            initialUsername={username}
            initialBio={bio}
            initialAvatarUrl={avatarUrl}
            onSaved={() => {
              router.refresh();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
