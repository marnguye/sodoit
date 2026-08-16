"use client";

import { useEffect, useRef, useState } from "react";
import { Globe2, Lock } from "lucide-react";
import { Button, ShareButton } from "@/components/ui";
import { setListVisibility } from "./collections/actions";
import type { Visibility } from "./collections/types";

interface ListVisibilityControlProps {
  username: string;
  visibility: Visibility;
}

export function ListVisibilityControl({
  username,
  visibility: initialVisibility,
}: ListVisibilityControlProps) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function confirmChange(next: Visibility) {
    setPending(true);
    try {
      await setListVisibility(next);
      setVisibility(next);
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  const isPublic = visibility === "public";

  return (
    <div className="flex items-center gap-2">
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={[
            "inline-flex h-8 items-center gap-1.5 rounded-control border px-3",
            "text-xs font-semibold transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
            isPublic
              ? "border-accent/40 bg-accent-wash text-accent-dark"
              : "border-border bg-surface text-secondary hover:border-border-strong hover:text-ink",
          ].join(" ")}
        >
          {isPublic ? (
            <Globe2 aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <Lock aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          {isPublic ? "Public" : "Private"}
        </button>

        {open && (
          <div
            role="dialog"
            aria-label="List visibility"
            className="absolute right-0 top-full z-40 mt-1 w-72 rounded-panel border border-border bg-surface p-4"
          >
            {isPublic ? (
              <>
                <p className="text-sm leading-5 text-secondary">
                  Anyone with the link can view your list at{" "}
                  <span className="font-semibold text-ink">
                    /u/{username}/list
                  </span>
                  .
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  disabled={pending}
                  onClick={() => confirmChange("private")}
                >
                  Make private
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm leading-5 text-secondary">
                  Your list is private. Make it public to share it at{" "}
                  <span className="font-semibold text-ink">
                    /u/{username}/list
                  </span>
                  .
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 w-full"
                  disabled={pending}
                  onClick={() => confirmChange("public")}
                >
                  Make public
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {isPublic && (
        <ShareButton
          url={`/u/${username}/list`}
          title="My list"
          variant="outline"
          size="sm"
        />
      )}
    </div>
  );
}
