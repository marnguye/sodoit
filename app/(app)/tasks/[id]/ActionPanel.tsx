"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Share2, ListPlus } from "lucide-react";
import { Card } from "@/components/ui";
import { addToList, removeFromList } from "@/app/(app)/browse/actions";

interface ActionPanelProps {
  taskId: string;
  taskTitle: string;
  initialDone: boolean;
  signedIn: boolean;
  totalCompleted: number;
}

export function ActionPanel({
  taskId,
  taskTitle,
  initialDone,
  signedIn,
  totalCompleted,
}: ActionPanelProps) {
  const router = useRouter();
  const [done, setDone] = useState(initialDone);
  const [shared, setShared] = useState(false);
  const [, startTransition] = useTransition();

  function toggle() {
    if (!signedIn) {
      router.push("/login");
      return;
    }

    const next = !done;
    setDone(next);

    startTransition(() => {
      if (next) addToList(taskId);
      else removeFromList(taskId);
    });
  }

  async function share() {
    const url =
      typeof window !== "undefined" ? window.location.href : `/tasks/${taskId}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: taskTitle, url });
        return;
      } catch {}
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2">
        <button
          type="button"
          onClick={toggle}
          className={`h-11 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
            done
              ? "bg-accent-light text-accent-dark"
              : "bg-accent hover:bg-accent-dark text-white"
          }`}
        >
          <Check className="h-4 w-4" />
          {done ? "Completed" : "Mark as complete"}
        </button>

        <button
          type="button"
          onClick={toggle}
          className="h-11 rounded-md border border-border text-sm font-semibold text-ink hover:bg-background transition-colors flex items-center justify-center gap-2"
        >
          <ListPlus className="h-4 w-4" />
          {done ? "Added to My List" : "Add to My List"}
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
