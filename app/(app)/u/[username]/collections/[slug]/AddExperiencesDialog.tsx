"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";

import { Button, ExperienceImage, ExperienceMeta } from "@/components/ui";
import { SearchField } from "@/components/ui/SearchField";
import { getDifficulty, getTaskMeta } from "@/app/(app)/browse/types";
import type { Experience } from "@/app/(app)/browse/types";
import { addExperienceToCollection } from "@/app/(app)/list/collections/actions";

interface AddExperiencesDialogProps {
  collectionId: string;
  collectionItems: Experience[];
  myListExperiences: Experience[];
  onAdded: (experiences: Experience[]) => void;
  onClose: () => void;
}

export function AddExperiencesDialog({
  collectionId,
  collectionItems,
  myListExperiences,
  onAdded,
  onClose,
}: AddExperiencesDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const existingIds = useMemo(
    () => new Set(collectionItems.map((experience) => experience.id)),
    [collectionItems],
  );

  const available = useMemo(() => {
    const query = search.trim().toLowerCase();
    return myListExperiences.filter((experience) => {
      if (!query) return true;
      return [
        experience.title,
        experience.description,
        experience.category,
        experience.city,
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [myListExperiences, search]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !adding) onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [adding, onClose]);

  function toggle(experienceId: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(experienceId)) next.delete(experienceId);
      else next.add(experienceId);
      return next;
    });
  }

  async function addSelected() {
    if (selected.size === 0) return;

    setAdding(true);
    setError(null);
    const added: Experience[] = [];

    for (const experience of myListExperiences) {
      if (!selected.has(experience.id) || existingIds.has(experience.id)) {
        continue;
      }

      const addedSuccessfully = await addExperienceToCollection(
        collectionId,
        experience.id,
      );
      if (!addedSuccessfully) {
        setError("We couldn’t add every experience. Please try again.");
        break;
      }
      added.push(experience);
    }

    if (added.length) onAdded(added);
    if (added.length === selected.size) onClose();
    setAdding(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-experiences-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[min(720px,90vh)] w-full max-w-lg flex-col rounded-t-panel border border-border bg-surface outline-none sm:rounded-panel"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div>
            <h2 id="add-experiences-title" className="text-base font-bold text-ink">
              Add experiences
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Choose experiences from your My List.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto p-4 sm:p-5">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search your My List..."
          />

          {error && (
            <p
              role="alert"
              className="rounded-control bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {myListExperiences.length === 0 ? (
            <p className="rounded-control border border-dashed border-border px-4 py-8 text-center text-sm text-secondary">
              Your My List is empty.
            </p>
          ) : available.length === 0 ? (
            <p className="rounded-control border border-dashed border-border px-4 py-8 text-center text-sm text-secondary">
              No experiences found.
            </p>
          ) : (
            <ul className="space-y-1">
              {available.map((experience) => {
                const alreadyAdded = existingIds.has(experience.id);
                const isSelected = selected.has(experience.id);

                return (
                  <li key={experience.id}>
                    <label
                      className={[
                        "flex cursor-pointer items-center gap-3 rounded-control border p-2.5 transition-colors",
                        alreadyAdded
                          ? "cursor-default border-border bg-surface-subtle/60 opacity-70"
                          : isSelected
                            ? "border-accent/50 bg-accent-wash"
                            : "border-transparent hover:border-border hover:bg-surface-subtle",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={alreadyAdded || isSelected}
                        disabled={alreadyAdded || adding}
                        onChange={() => toggle(experience.id)}
                        className="sr-only"
                      />

                      <span
                        aria-hidden="true"
                        className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-control border",
                          alreadyAdded || isSelected
                            ? "border-accent bg-accent text-white"
                            : "border-border-strong bg-surface",
                        ].join(" ")}
                      >
                        {(alreadyAdded || isSelected) && (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        )}
                      </span>

                      <ExperienceImage
                        imageUrl={experience.image_url}
                        imageAlt={experience.image_alt}
                        title={experience.title}
                        fallbackColor={getTaskMeta(experience.id).thumbnail}
                        sizes="48px"
                        className="h-12 w-12 shrink-0 rounded-media"
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {experience.title}
                        </span>
                        <ExperienceMeta
                          className="mt-1"
                          category={experience.category}
                          difficulty={getDifficulty(experience.id, experience.difficulty).label}
                          location={experience.city}
                        />
                      </span>

                      {alreadyAdded && (
                        <span className="shrink-0 text-xs font-semibold text-muted">
                          In collection
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-4 sm:p-5">
          <span className="text-xs text-secondary">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={adding || selected.size === 0}
              onClick={addSelected}
            >
              {adding ? "Adding..." : "Add selected"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
