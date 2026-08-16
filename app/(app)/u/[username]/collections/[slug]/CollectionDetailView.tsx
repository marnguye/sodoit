"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2, Lock } from "lucide-react";

import {
  Button,
  EmptyState,
  PageHero,
  ShareButton,
  ViewToggle,
} from "@/components/ui";
import { SearchField } from "@/components/ui/SearchField";
import { ExperienceResults } from "@/app/(app)/browse/components/ExperienceResults";
import { setListStatus } from "@/app/(app)/browse/actions";
import type { BrowseView, Experience } from "@/app/(app)/browse/types";
import {
  removeExperienceFromCollection,
  renameCollection,
  setCollectionVisibility,
} from "@/app/(app)/list/collections/actions";
import type { Collection } from "@/app/(app)/list/collections/types";
import { AddExperiencesDialog } from "./AddExperiencesDialog";

interface CollectionDetailViewProps {
  username: string;
  isOwner: boolean;
  collection: Collection;
  experiences: Experience[];
  completedIds: string[];
  myListExperiences: Experience[];
}

export function CollectionDetailView({
  username,
  isOwner,
  collection: initialCollection,
  experiences: initialExperiences,
  completedIds: initialCompletedIds,
  myListExperiences,
}: CollectionDetailViewProps) {
  const router = useRouter();

  const [collection, setCollection] = useState(initialCollection);
  const [experiences, setExperiences] = useState(initialExperiences);
  const [completedIds, setCompletedIds] = useState(
    () => new Set(initialCompletedIds),
  );
  const [view, setView] = useState<BrowseView>("grid");
  const [search, setSearch] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(collection.name);
  const [adding, setAdding] = useState(false);

  const isPublic = collection.visibility === "public";

  async function submitRename() {
    const trimmed = name.trim();
    setRenaming(false);
    if (!trimmed || trimmed === collection.name) return;

    setCollection((previous) => ({ ...previous, name: trimmed }));
    await renameCollection(collection.id, trimmed);
  }

  async function toggleVisibility() {
    const next = isPublic ? "private" : "public";
    setCollection((previous) => ({ ...previous, visibility: next }));
    await setCollectionVisibility(collection.id, next);
  }

  async function removeItem(experienceId: string) {
    setExperiences((previous) =>
      previous.filter((experience) => experience.id !== experienceId),
    );
    setCollection((previous) => ({
      ...previous,
      itemCount: Math.max(0, previous.itemCount - 1),
    }));
    await removeExperienceFromCollection(collection.id, experienceId);
  }

  function addItems(added: Experience[]) {
    setExperiences((previous) => {
      const existing = new Set(previous.map((experience) => experience.id));
      return [
        ...previous,
        ...added.filter((experience) => !existing.has(experience.id)),
      ];
    });
    setCollection((previous) => ({
      ...previous,
      itemCount: previous.itemCount + added.length,
    }));
  }

  async function toggleComplete(experienceId: string) {
    const isDone = completedIds.has(experienceId);

    setCompletedIds((previous) => {
      const next = new Set(previous);
      if (isDone) next.delete(experienceId);
      else next.add(experienceId);
      return next;
    });

    await setListStatus(experienceId, isDone ? "saved" : "completed");
  }

  const filteredExperiences = search.trim()
    ? experiences.filter((experience) => {
        const query = search.trim().toLowerCase();
        return [
          experience.title,
          experience.description,
          experience.category,
          experience.city,
        ].some((value) => value?.toLowerCase().includes(query));
      })
    : experiences;

  async function noop(): Promise<void> {}

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => router.push(isOwner ? "/list" : `/u/${username}/list`)}
        className="text-xs font-semibold text-secondary transition-colors hover:text-ink"
      >
        &larr; {isOwner ? "My list" : `${username}'s list`}
      </button>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {renaming ? (
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
              className="h-10 rounded-control border border-border bg-surface px-3 text-2xl font-extrabold text-ink focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/10 sm:text-3xl"
            />
          ) : (
            <PageHero
              title={collection.name}
              subtitle={`${collection.itemCount} experience${collection.itemCount === 1 ? "" : "s"} · by ${username}`}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isOwner && (
            <Button type="button" size="sm" onClick={() => setAdding(true)}>
              Add experiences
            </Button>
          )}

          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => setRenaming(true)}
                className="inline-flex h-8 shrink-0 items-center rounded-control border border-border bg-surface px-3 text-xs font-semibold text-secondary transition-colors hover:border-border-strong hover:text-ink"
              >
                Rename
              </button>

              <button
                type="button"
                onClick={toggleVisibility}
                className={[
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border px-3",
                  "text-xs font-semibold transition-colors",
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
            </>
          )}
        </div>

        {isPublic && (
          <ShareButton
            url={`/u/${username}/collections/${collection.slug}`}
            title={collection.name}
            size="sm"
          />
        )}
      </div>

      {experiences.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No experiences yet"
            description={
              isOwner
                ? "Add experiences from your My List to start building this collection."
                : "This collection does not have any experiences yet."
            }
            action={
              isOwner ? (
                <Button type="button" onClick={() => setAdding(true)}>
                  Add experiences
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-2.5 border-b border-border pb-2.5 sm:flex-row sm:items-center sm:justify-between">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search this collection..."
              className="w-full sm:max-w-sm"
            />

            <ViewToggle view={view} onChange={setView} />
          </div>

          <div className="mt-4">
            {filteredExperiences.length === 0 ? (
              <EmptyState
                title="No experiences found"
                description="Try a different search."
              />
            ) : isOwner ? (
              <ExperienceResults
                experiences={filteredExperiences}
                view={view}
                completed={completedIds}
                onToggle={toggleComplete}
                onRemove={removeItem}
                removeLabel="Remove from collection"
              />
            ) : (
              <ExperienceResults
                experiences={filteredExperiences}
                view={view}
                completed={completedIds}
                onToggle={noop}
                guest
              />
            )}
          </div>
        </>
      )}

      {isOwner && adding && (
        <AddExperiencesDialog
          collectionId={collection.id}
          collectionItems={experiences}
          myListExperiences={myListExperiences}
          onAdded={addItems}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}
