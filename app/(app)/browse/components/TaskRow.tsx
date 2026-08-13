"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Check, Sparkles } from "lucide-react";

import { useAchievementUnlock } from "@/app/(app)/achievements/components/AchievementUnlockProvider";
import { checkAndUnlockAchievements } from "@/app/(app)/achievements/actions";
import { ExperienceImage } from "@/components/ui";

import type { Experience } from "../types";
import { getDifficulty, getTaskMeta } from "../types";

interface TaskRowProps {
  experience: Experience;
  done: boolean;
  onToggle: () => Promise<void>;
  onRemove?: () => void;
  guest?: boolean;
  onGuestSave?: () => void;
  className?: string;
}

export function TaskRow({
  experience,
  done,
  onToggle,
  onRemove,
  guest = false,
  onGuestSave,
  className = "",
}: TaskRowProps) {
  const { showAchievements } = useAchievementUnlock();

  const [prevDone, setPrevDone] = useState(done);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const { thumbnail } = getTaskMeta(experience.id);
  const difficulty = getDifficulty(experience.id, experience.difficulty);

  if (prevDone !== done) {
    const justCompleted = done && !prevDone;

    setPrevDone(done);

    if (justCompleted) {
      setIsCelebrating(true);
    }
  }

  useEffect(() => {
    if (!isCelebrating) return;

    const timeout = window.setTimeout(() => {
      setIsCelebrating(false);
    }, 650);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isCelebrating]);

  async function handleToggle() {
    if (isToggling) return;

    const completing = !done;

    setIsToggling(true);

    try {
      await onToggle();

      if (!completing) return;

      const unlockedAchievements = await checkAndUnlockAchievements();
      showAchievements(unlockedAchievements);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <li
      className={[
        "task-card relative rounded-card transition-colors duration-200",
        "hover:bg-surface-subtle",
        done ? "is-done" : "",
        isCelebrating ? "is-celebrating" : "",
        className,
      ].join(" ")}
    >
      <Link
        href={`/tasks/${experience.id}`}
        aria-label={experience.title}
        className="absolute inset-0 z-10 rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />

      <div className="pointer-events-none flex items-center gap-3 rounded-card p-3">
        <ExperienceImage
          imageUrl={experience.image_url}
          imageAlt={experience.image_alt}
          title={experience.title}
          fallbackColor={thumbnail}
          sizes="56px"
          quality={90}
          className="h-14 w-14 shrink-0 rounded-media"
        />

        <div className="min-w-0 flex-1">
          <div className="task-check-track flex min-w-0 items-center gap-3">
            {!guest && (
              <button
                type="button"
                role="checkbox"
                aria-checked={done}
                aria-label={`${
                  done ? "Mark as incomplete" : "Mark as complete"
                }: ${experience.title}`}
                onClick={handleToggle}
                disabled={isToggling}
                className="pointer-events-auto relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-control outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:pointer-events-none disabled:opacity-60"
              >
                <span className="task-checkbox" aria-hidden="true">
                  <Check className="task-checkmark h-3 w-3" strokeWidth={3} />
                </span>
              </button>
            )}

            <span className="task-title-wrap">
              <span
                className={[
                  "task-title line-clamp-2 text-sm font-semibold text-ink sm:truncate",
                  done ? "line-through sm:no-underline" : "",
                ].join(" ")}
              >
                {experience.title}
              </span>

              <span
                aria-hidden="true"
                className="task-strike-line hidden sm:block"
              />
            </span>
          </div>

          <div
            className={[
              "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1",
              guest ? "" : "pl-12",
            ].join(" ")}
          >
            {experience.category && (
              <span className="rounded-pill border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                {experience.category}
              </span>
            )}

            <span
              className="flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: difficulty.color }}
            >
              <Sparkles className="h-3 w-3" />
              {difficulty.label}
            </span>
          </div>
        </div>

        {guest && onGuestSave && (
          <button
            type="button"
            onClick={onGuestSave}
            aria-label={`Save ${experience.title}`}
            className="pointer-events-auto relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-subtle hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        )}

        {!guest && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${experience.title} from My List`}
            className="pointer-events-auto relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-accent transition-colors hover:bg-accent-wash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <Bookmark className="h-4 w-4" fill="currentColor" />
          </button>
        )}
      </div>
    </li>
  );
}
