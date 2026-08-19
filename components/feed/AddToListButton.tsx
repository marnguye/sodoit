"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Check, ListPlus } from "lucide-react";
import { setListStatus } from "@/app/(app)/browse/actions";
import { loginHrefWithNext } from "@/lib/auth-redirect";

interface AddToListButtonProps {
  experienceId: string;
  initialStatus: "saved" | "completed" | null;
  signedIn: boolean;
}

export function AddToListButton({
  experienceId,
  initialStatus,
  signedIn,
}: AddToListButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  if (status === "completed") {
    return (
      <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control px-3 text-xs font-semibold text-success">
        <Check aria-hidden="true" className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control px-3 text-xs font-semibold text-accent-dark">
        <Check aria-hidden="true" className="h-3.5 w-3.5" />
        In my list
      </span>
    );
  }

  function handleClick() {
    if (!signedIn) {
      router.push(loginHrefWithNext(pathname));
      return;
    }

    setStatus("saved");
    startTransition(() => {
      setListStatus(experienceId, "saved");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-accent/40 hover:bg-accent-wash hover:text-accent-dark disabled:opacity-60"
    >
      <ListPlus aria-hidden="true" className="h-3.5 w-3.5" />
      Add to my list
    </button>
  );
}
