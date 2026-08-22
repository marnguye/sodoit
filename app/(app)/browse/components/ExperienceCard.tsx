"use client";

import Link from "next/link";
import { FolderPlus } from "lucide-react";

import { ExperienceImage, experienceLocation } from "@/components/ui";

import type { Experience } from "../types";
import { getDifficulty, getTaskMeta } from "../types";
import { useCompletionToggle } from "../hooks/useCompletionToggle";
import { SaveButton } from "./SaveButton";
import { ExperienceSaveControl } from "./ExperienceSaveControl";
import { ExperienceMetaLine } from "./ExperienceMetaLine";
import { ExperienceSocialProof } from "./ExperienceSocialProof";
import { COMPLETED_MEDIA } from "./completedStyles";

interface ExperienceCardProps {
  experience: Experience;
  done: boolean;
  onToggle: () => Promise<void>;
  onRemove?: () => void;
  removeLabel?: string;
  onManageCollections?: () => void;
  guest?: boolean;
  onGuestSave?: () => void;
  className?: string;
  ratio?: "wide" | "standard";
  showCategory?: boolean;
}

const RATIO_CLASS = {
  wide: "aspect-[16/9]",
  standard: "aspect-[4/3]",
} as const;

const TITLE_CLASS = {
  wide: "text-base font-bold sm:text-lg",
  standard: "text-sm font-semibold",
} as const;

export function ExperienceCard({
  experience,
  done,
  onToggle,
  onRemove,
  removeLabel,
  onManageCollections,
  guest = false,
  onGuestSave,
  className = "",
  ratio = "standard",
  showCategory = true,
}: ExperienceCardProps) {
  const { thumbnail } = getTaskMeta(experience.id);
  const difficulty = getDifficulty(experience.id, experience.difficulty);
  const { isToggling, handleToggle } = useCompletionToggle(done, onToggle);

  return (
    <li
      className={[
        "group relative flex h-full min-w-0 flex-col",
        className,
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-card">
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
          sizes={
            ratio === "wide"
              ? "(min-width: 1024px) 45vw, 90vw"
              : "(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
          }
          quality={90}
          className={[
            RATIO_CLASS[ratio],
            "w-full motion-safe:transition-transform motion-safe:duration-200",
            "motion-safe:group-hover:scale-[1.02]",
            done ? COMPLETED_MEDIA : "",
          ].join(" ")}
        />

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
          <ExperienceSaveControl
            mode={guest ? "guest" : "toggle"}
            done={done}
            onClick={guest ? (onGuestSave ?? (() => {})) : handleToggle}
            disabled={!guest && isToggling}
            label={
              guest
                ? `Save ${experience.title}`
                : `${done ? "Mark as incomplete" : "Mark as complete"}: ${experience.title}`
            }
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col pt-3">
        <Link
          href={`/tasks/${experience.id}`}
          className="relative z-10 w-fit max-w-full outline-none"
        >
          <h3
            className={[
              "line-clamp-2 leading-5 tracking-[-0.01em] text-ink transition-colors duration-200",
              "group-hover:text-accent-dark",
              TITLE_CLASS[ratio],
            ].join(" ")}
          >
            {experience.title}
          </h3>
        </Link>

        <div className="mt-1">
          <ExperienceMetaLine
            location={experienceLocation(experience)}
            difficulty={difficulty.label}
            category={experience.category}
            showCategory={showCategory}
          />
        </div>

        <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
          <ExperienceSocialProof savedCount={experience.saved_count} />

          {onManageCollections && (
            <button
              type="button"
              onClick={onManageCollections}
              aria-label={`Manage collections for ${experience.title}`}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <FolderPlus aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
