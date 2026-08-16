"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui";
import {
  addExperienceToCollection,
  createCollection,
  removeExperienceFromCollection,
} from "./actions";
import type { Collection } from "./types";

interface AddToCollectionMenuProps {
  experienceId: string;
  experienceTitle: string;
  collections: Collection[];
  memberOf: Set<string>;
  onClose: () => void;
  onToggled: (collectionId: string, member: boolean) => void;
  onCreated: (collection: Collection) => void;
}

export function AddToCollectionMenu({
  experienceId,
  experienceTitle,
  collections,
  memberOf,
  onClose,
  onToggled,
  onCreated,
}: AddToCollectionMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, setPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function toggle(collectionId: string) {
    const isMember = memberOf.has(collectionId);

    setPending((previous) => new Set(previous).add(collectionId));
    onToggled(collectionId, !isMember);

    try {
      if (isMember) {
        await removeExperienceFromCollection(collectionId, experienceId);
      } else {
        await addExperienceToCollection(collectionId, experienceId);
      }
    } finally {
      setPending((previous) => {
        const next = new Set(previous);
        next.delete(collectionId);
        return next;
      });
    }
  }

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const result = await createCollection(trimmed);
    if (!result) return;

    const collection: Collection = {
      id: result.id,
      slug: result.slug,
      name: trimmed,
      description: null,
      visibility: "private",
      itemCount: 0,
    };

    onCreated(collection);
    setNewName("");
    setCreating(false);
    await toggle(collection.id);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/20 sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-label={`Manage collections for ${experienceTitle}`}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-t-panel border border-border bg-surface p-4 outline-none sm:rounded-panel"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="line-clamp-1 text-sm font-bold text-ink">
            Add to collection
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {collections.map((collection) => {
            const isMember = memberOf.has(collection.id);
            const isPending = pending.has(collection.id);

            return (
              <li key={collection.id}>
                <button
                  type="button"
                  onClick={() => toggle(collection.id)}
                  disabled={isPending}
                  aria-pressed={isMember}
                  className="flex w-full items-center justify-between gap-2 rounded-control px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle disabled:opacity-60"
                >
                  <span className="truncate">{collection.name}</span>

                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-control border",
                      isMember
                        ? "border-accent bg-accent text-white"
                        : "border-border-strong",
                    ].join(" ")}
                  >
                    {isMember && (
                      <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {collections.length === 0 && !creating && (
          <p className="px-3 py-2 text-sm text-muted">
            You don&apos;t have any collections yet.
          </p>
        )}

        {creating ? (
          <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
            <input
              autoFocus
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCreate();
              }}
              placeholder="Collection name"
              maxLength={60}
              className="h-9 flex-1 rounded-control border border-border bg-surface px-3 text-sm text-ink focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/10"
            />
            <Button type="button" size="sm" onClick={handleCreate}>
              Create
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-2 flex w-full items-center gap-2 rounded-control border-t border-border px-3 py-2.5 text-left text-sm font-semibold text-accent-dark transition-colors hover:bg-surface-subtle"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Create new collection
          </button>
        )}
      </div>
    </div>
  );
}
