"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Check, Share2, ListPlus } from "lucide-react";
import { Card } from "@/components/ui";
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
      try {
        await navigator.share({ title: taskTitle, url });
        return;
      } catch {
        // user cancelled the share sheet — fall through to clipboard copy
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  const saveLocked = status === "completed";
  const saveLabel =
    status === "saved"
      ? "Saved"
      : status === "completed"
        ? "In My List"
        : "Add to My List";

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2">
        <button
          type="button"
          onClick={toggleComplete}
          className={`h-11 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
            status === "completed"
              ? "bg-accent-light text-accent-dark"
              : "bg-accent hover:bg-accent-dark text-white"
          }`}
        >
          <Check className="h-4 w-4" />
          {status === "completed" ? "Completed" : "Mark as complete"}
        </button>

        <button
          type="button"
          onClick={toggleSave}
          disabled={saveLocked}
          aria-disabled={saveLocked}
          className={`h-11 rounded-md border border-border text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            saveLocked
              ? "text-muted cursor-default"
              : "text-ink hover:bg-background"
          }`}
        >
          <ListPlus className="h-4 w-4" />
          {saveLabel}
        </button>

        <button
          type="button"
          onClick={share}
          className="h-11 rounded-md border border-border text-sm font-semibold text-ink hover:bg-background transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          {shared ? "Link copied" : "Share"}
        </button>
      </Card>

      <Card>
        <p className="text-sm font-bold text-ink">Your progress</p>
        {signedIn ? (
          <p className="mt-1 text-sm text-muted">
            You&apos;ve completed{" "}
            <span className="font-semibold text-ink">{totalCompleted}</span>{" "}
            experience{totalCompleted === 1 ? "" : "s"} so far.
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">
            Log in to track your progress.
          </p>
        )}
      </Card>
    </div>
  );
}
