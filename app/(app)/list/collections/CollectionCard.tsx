"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Globe2, Lock, MoreHorizontal } from "lucide-react";
import {
  deleteCollection,
  renameCollection,
  setCollectionVisibility,
} from "./actions";
import type { Collection } from "./types";

interface CollectionCardProps {
  username: string;
  collection: Collection;
  onRenamed: (id: string, name: string) => void;
  onDeleted: (id: string) => void;
  onVisibilityChanged: (
    id: string,
    visibility: Collection["visibility"],
  ) => void;
}

export function CollectionCard({
  username,
  collection,
  onRenamed,
  onDeleted,
  onVisibilityChanged,
}: CollectionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(collection.name);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  async function submitRename() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== collection.name) {
      onRenamed(collection.id, trimmed);
      await renameCollection(collection.id, trimmed);
    }
    setRenaming(false);
  }

  async function toggleVisibility() {
    const next = collection.visibility === "public" ? "private" : "public";
    onVisibilityChanged(collection.id, next);
    setMenuOpen(false);
    await setCollectionVisibility(collection.id, next);
  }

  async function handleDelete() {
    setMenuOpen(false);
    onDeleted(collection.id);
    await deleteCollection(collection.id);
  }

  if (renaming) {
    return (
      <div className="flex h-[72px] w-40 shrink-0 flex-col justify-center gap-1.5 rounded-card border border-border bg-surface p-3">
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={submitRename}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitRename();
            if (event.key === "Escape") setRenaming(false);
          }}
          maxLength={60}
          className="h-8 w-full rounded-control border border-border bg-surface px-2 text-sm font-semibold text-ink focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/10"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[72px] w-40 shrink-0 rounded-card border border-border bg-surface p-3 transition-colors hover:border-border-strong"
    >
      <Link
        href={`/u/${username}/collections/${collection.slug}`}
        className="absolute inset-0 rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        aria-label={collection.name}
      />

      <div className="pointer-events-none flex items-start justify-between gap-1">
        <p className="line-clamp-1 text-sm font-semibold text-ink">
          {collection.name}
        </p>

        {collection.visibility === "public" ? (
          <Globe2
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 text-muted"
          />
        ) : (
          <Lock
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 text-muted"
          />
        )}
      </div>

      <p className="pointer-events-none mt-1 text-xs text-muted">
        {collection.itemCount} experience{collection.itemCount === 1 ? "" : "s"}
      </p>

      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-label={`Manage ${collection.name}`}
        aria-expanded={menuOpen}
        className="pointer-events-auto absolute bottom-2 right-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-40 rounded-panel border border-border bg-surface p-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              setRenaming(true);
            }}
            className="flex w-full items-center rounded-control px-3 py-1.5 text-left text-xs font-semibold text-secondary transition-colors hover:bg-surface-subtle hover:text-ink"
          >
            Rename
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={toggleVisibility}
            className="flex w-full items-center rounded-control px-3 py-1.5 text-left text-xs font-semibold text-secondary transition-colors hover:bg-surface-subtle hover:text-ink"
          >
            Make {collection.visibility === "public" ? "private" : "public"}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleDelete}
            className="flex w-full items-center rounded-control px-3 py-1.5 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
