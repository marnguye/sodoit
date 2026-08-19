"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import {
  ExperienceImage,
  ExperienceMeta,
  Badge,
  experienceLocation,
} from "@/components/ui";

import type { Experience } from "../types";
import { getDifficulty, getTaskMeta } from "../types";
import { useCompletionToggle } from "../hooks/useCompletionToggle";
import { SaveButton } from "./SaveButton";

interface ExperienceFeatureProps {
  experience: Experience;
  done: boolean;
  onToggle: () => Promise<void>;
  guest?: boolean;
  onGuestSave?: () => void;
}

export function ExperienceFeature({
  experience,
  done,
  onToggle,
  guest = false,
  onGuestSave,
}: ExperienceFeatureProps) {
  const { thumbnail } = getTaskMeta(experience.id);
  const difficulty = getDifficulty(experience.id, experience.difficulty);
  const { isToggling, handleToggle } = useCompletionToggle(done, onToggle);
  const location = experienceLocation(experience);

  return (
    <section className="relative mb-8 grid overflow-hidden rounded-panel md:h-[420px] md:grid-cols-2 md:items-stretch md:gap-0">
      <Link
        href={`/tasks/${experience.id}`}
        aria-label={experience.title}
        className="absolute inset-0 z-10 rounded-panel outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />

      <ExperienceImage
        imageUrl={experience.image_url}
        imageAlt={experience.image_alt}
        title={experience.title}
        fallbackColor={thumbnail}
        sizes="(min-width: 768px) 50vw, 100vw"
        quality={90}
        priority
        className="aspect-[4/3] w-full md:aspect-auto md:h-full"
      />

      <div className="pointer-events-none flex flex-col justify-center gap-3 bg-surface p-5 sm:p-6">
        <Badge variant="accent" className="w-fit">
          Featured
        </Badge>

        <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-3xl">
          {experience.title}
        </h2>

        {experience.description && (
          <p className="line-clamp-3 max-w-lg text-sm leading-6 text-secondary">
            {experience.description}
          </p>
        )}

        <ExperienceMeta
          category={experience.category}
          difficulty={difficulty.label}
          location={location}
        />

        <div className="pointer-events-auto mt-2 flex items-center gap-2">
          {guest && onGuestSave ? (
            <SaveButton
              label={`Save ${experience.title}`}
              onClick={onGuestSave}
              className="h-10 w-10 border border-border bg-surface"
            />
          ) : (
            <button
              type="button"
              role="checkbox"
              aria-checked={done}
              aria-label={`${done ? "Mark as incomplete" : "Mark as complete"}: ${experience.title}`}
              onClick={handleToggle}
              disabled={isToggling}
              className={[
                "inline-flex h-10 items-center gap-2 rounded-control px-4 text-sm font-semibold",
                "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                "disabled:pointer-events-none disabled:opacity-60",
                done
                  ? "bg-accent text-white"
                  : "border border-border bg-surface text-ink hover:border-border-strong",
              ].join(" ")}
            >
              <Check aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
              {done ? "Completed" : "Mark as complete"}
            </button>
          )}

          <span className="text-sm font-semibold text-accent-dark">
            View experience
          </span>
        </div>
      </div>
    </section>
  );
}
