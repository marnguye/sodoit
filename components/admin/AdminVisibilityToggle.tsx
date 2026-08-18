"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface AdminVisibilityToggleProps {
  id: string;
  isPublic: boolean;
  action: (
    id: string,
    isPublic: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
}

export function AdminVisibilityToggle({
  id,
  isPublic,
  action,
}: AdminVisibilityToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await action(id, !isPublic);
      if (result.success) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      title={isPublic ? "Hide" : "Publish"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-subtle hover:text-ink disabled:opacity-50"
    >
      {isPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}
