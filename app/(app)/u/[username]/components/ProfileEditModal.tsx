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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/20 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[min(720px,90vh)] w-full max-w-[480px] overflow-y-auto rounded-panel border border-border bg-surface p-4 shadow-popover sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-subtle hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 id="profile-edit-title" className="text-lg font-extrabold text-ink">
          Edit profile
        </h2>

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
