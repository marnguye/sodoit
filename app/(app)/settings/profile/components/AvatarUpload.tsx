"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Avatar, Button } from "@/components/ui";
import { removeAvatar, updateAvatarUrl } from "../actions";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

interface AvatarUploadProps {
  userId: string;
  username: string;
  avatarUrl: string | null;
  onChange: (url: string | null) => void;
}

export function AvatarUpload({
  userId,
  username,
  avatarUrl,
  onChange,
}: AvatarUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = uploading || removing;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);

    const ext = ALLOWED_TYPES[file.type];

    if (!ext) {
      setError("Use a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);

    setPreview(localPreview);
    setUploading(true);

    try {
      const supabase = createClient();
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadError) {
        throw uploadError;
      }

      const result = await updateAvatarUrl(path);

      if (!result.success || !result.url) {
        throw new Error(result.error);
      }

      const url = result.url;

      const obsoletePaths = Object.values(ALLOWED_TYPES)
        .filter((extension) => extension !== ext)
        .map((extension) => `${userId}/avatar.${extension}`);

      await supabase.storage.from("avatars").remove(obsoletePaths);

      setPreview(url);
      onChange(url);

      router.refresh();
    } catch {
      setPreview(avatarUrl);
      setError("Could not upload image. Please try again.");
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!preview || removing) {
      return;
    }

    setError(null);
    setRemoving(true);

    try {
      const result = await removeAvatar();

      if (!result.success) {
        throw new Error(result.error);
      }

      setPreview(null);
      onChange(null);

      router.refresh();
    } catch {
      setError("Could not remove avatar. Please try again.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar name={username || "User"} src={preview} size="lg" />

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading..." : "Change photo"}
          </Button>

          {preview && (
            <button
              type="button"
              disabled={busy}
              onClick={handleRemove}
              className="text-xs font-semibold text-muted transition-colors hover:text-red-600 disabled:opacity-50"
            >
              {removing ? "Removing..." : "Remove"}
            </button>
          )}
        </div>

        <p className="mt-1.5 text-xs text-muted">JPG, PNG or WEBP. Max 5 MB.</p>

        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
