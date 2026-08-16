"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Check, Share2, ListPlus } from "lucide-react";
import { Button } from "@/components/ui";
import { setListStatus, removeFromMyList } from "@/app/(app)/browse/actions";
import { loginHrefWithNext } from "@/lib/auth-redirect";
import type { ListStatus } from "@/app/(app)/browse/types";

interface ActionPanelProps {
  taskId: string;
  taskTitle: string;
  initialStatus: ListStatus | null;
  signedIn: boolean;
  totalCompleted: number;
}

export function ActionPanel({
  taskId,
  taskTitle,
  initialStatus,
  signedIn,
  totalCompleted,
}: ActionPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<ListStatus | null>(initialStatus);
  const [shared, setShared] = useState(false);
  const [, startTransition] = useTransition();

  function apply(next: ListStatus | null) {
    setStatus(next);
    startTransition(() => {
      if (next) setListStatus(taskId, next);
      else removeFromMyList(taskId);
    });
  }

  function toggleComplete() {
    if (!signedIn) {
      router.push(loginHrefWithNext(pathname));
      return;
    }
    apply(status === "completed" ? null : "completed");
  }

  function toggleSave() {
    if (!signedIn) {
      router.push(loginHrefWithNext(pathname));
      return;
    }
    if (status === "completed") return;
    apply(status === "saved" ? null : "saved");
  }

  async function share() {
    const url =
      typeof window !== "undefined" ? window.location.href : `/tasks/${taskId}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      const didShare = await navigator
        .share({ title: taskTitle, url })
        .then(() => true)
        .catch(() => false);

      if (didShare) return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  const completed = status === "completed";
  const saveLabel = completed
    ? "In My List"
    : status === "saved"
      ? "Saved"
      : "Add to My List";

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant={completed ? "soft" : "primary"}
          onClick={toggleComplete}
        >
          <Check aria-hidden="true" className="h-4 w-4" />
          {completed ? "Completed" : "Mark as complete"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={toggleSave}
          disabled={completed}
        >
          <ListPlus aria-hidden="true" className="h-4 w-4" />
          {saveLabel}
        </Button>

        <Button type="button" variant="outline" onClick={share}>
          <Share2 aria-hidden="true" className="h-4 w-4" />
          {shared ? "Link copied" : "Share"}
        </Button>
      </div>

      <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted">
        {signedIn ? (
          <>
            You&apos;ve completed{" "}
            <span className="font-semibold text-ink">{totalCompleted}</span>{" "}
            experience{totalCompleted === 1 ? "" : "s"} so far.
          </>
        ) : (
          "Log in to save this and track your progress."
        )}
      </p>
    </div>
  );
}
