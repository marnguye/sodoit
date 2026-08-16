"use client";

import Link from "next/link";
import { Check, FolderPlus } from "lucide-react";

import {
  ExperienceImage,
  ExperienceMeta,
  experienceLocation,
} from "@/components/ui";

import type { Experience } from "../types";
import { getDifficulty, getTaskMeta } from "../types";
import { useCompletionToggle } from "../hooks/useCompletionToggle";
import { COMPLETED_MEDIA, COMPLETED_TITLE } from "./completedStyles";
import { SaveButton } from "./SaveButton";

interface ExperienceCardProps {
  experience: Experience;
  done: boolean;
  onToggle: () => Promise<void>;
  onRemove?: () => void;
  removeLabel?: string;
  onManageCollections?: () => void;
  guest?: boolean;
  onGuestSave?: () => void;
}

export function ExperienceCard({
  experience,
  done,
  onToggle,
  onRemove,
  removeLabel,
  onManageCollections,
  guest = false,
  onGuestSave,
}: ExperienceCardProps) {
  const { thumbnail } = getTaskMeta(experience.id);
  const difficulty = getDifficulty(experience.id, experience.difficulty);
  const { isToggling, handleToggle } = useCompletionToggle(done, onToggle);

  return (
    <li className="relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-border-strong">
      <Link
        href={`/tasks/${experience.id}`}
        aria-label={experience.title}
        className="absolute inset-0 z-10 rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />

      <ExperienceImage
        imageUrl={experience.image_url}
        imageAlt={experience.image_alt}
        title={experience.title}
        fallbackColor={thumbnail}
        sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
        quality={90}
        className={[
          "aspect-[4/3] w-full transition-opacity",
          done ? COMPLETED_MEDIA : "",
        ].join(" ")}
      />

      <div className="pointer-events-none flex flex-1 flex-col gap-2 p-3">
        <h3
          className={[
            "line-clamp-2 text-sm font-semibold leading-5",
            done ? COMPLETED_TITLE : "text-ink",
          ].join(" ")}
        >
          {experience.title}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2">
          <ExperienceMeta
            category={experience.category}
            difficulty={difficulty.label}
            location={experienceLocation(experience)}
            dimmed={done}
          />

          {onManageCollections && (
            <button
              type="button"
              onClick={onManageCollections}
              aria-label={`Manage collections for ${experience.title}`}
              className="pointer-events-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <FolderPlus aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!guest && onRemove && (
        <div className="absolute left-2 top-2 z-20">
          <SaveButton
            label={
              removeLabel
                ? `${removeLabel}: ${experience.title}`
                : `Remove ${experience.title} from My List`
            }
            onClick={onRemove}
            saved
            className="bg-surface/90 backdrop-blur-sm"
          />
        </div>
      )}

      <div className="absolute right-2 top-2 z-20">
        {guest && onGuestSave ? (
          <SaveButton
            label={`Save ${experience.title}`}
            onClick={onGuestSave}
            className="bg-surface/90 backdrop-blur-sm"
          />
        ) : null}

        {!guest && (
          <button
            type="button"
            role="checkbox"
            aria-checked={done}
            aria-label={`${done ? "Mark as incomplete" : "Mark as complete"}: ${experience.title}`}
            onClick={handleToggle}
            disabled={isToggling}
            className={[
              "pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-control",
              "backdrop-blur-sm transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-accent/30",
              "disabled:pointer-events-none disabled:opacity-60",
              done
                ? "bg-accent text-white"
                : "bg-surface/90 text-muted hover:text-ink",
            ].join(" ")}
          >
            <Check aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
          </button>
        )}
      </div>
    </li>
  );
}
