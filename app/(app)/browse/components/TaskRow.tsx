"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, Check, Sparkles, Users } from "lucide-react";

import { useAchievementUnlock } from "@/app/(app)/achievements/components/AchievementUnlockProvider";
import { checkAndUnlockAchievements } from "@/app/(app)/achievements/actions";

import type { Experience } from "../types";
import { getTaskMeta } from "../types";
import { ExperienceImage } from "@/components/ui";

interface TaskRowProps {
  experience: Experience;
  done: boolean;
  onToggle: () => Promise<void>;
  onRemove?: () => void;
  guest?: boolean;
  onGuestSave?: () => void;
}

export function TaskRow({
  experience,
  done,
  onToggle,
  onRemove,
  guest = false,
  onGuestSave,
}: TaskRowProps) {
  const { showAchievements } = useAchievementUnlock();

  const previousDone = useRef(done);

  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const { difficulty, adoption, completions } = getTaskMeta(experience.id);

  useEffect(() => {
    if (previousDone.current === done) {
      return;
    }

    if (done) {
      setIsCelebrating(true);
    }

    previousDone.current = done;
  }, [done]);

  useEffect(() => {
    if (!isCelebrating) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsCelebrating(false);
    }, 650);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isCelebrating]);

  async function handleToggle() {
    if (isToggling) {
      return;
    }

    const completing = !done;

    setIsToggling(true);

    try {
      await onToggle();

      if (!completing) {
        return;
      }

      const unlockedAchievements = await checkAndUnlockAchievements();

      showAchievements(unlockedAchievements);
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <li
      className={[
        "task-card relative rounded-xl transition-colors duration-200 hover:bg-card",
        done ? "is-done" : "",
        isCelebrating ? "is-celebrating" : "",
      ].join(" ")}
    >
      <Link
        href={`/tasks/${experience.id}`}
        aria-label={experience.title}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
      />

      <div className="pointer-events-none flex items-center gap-4 rounded-xl p-3">
        <ExperienceImage
          id={experience.id}
          title={experience.title}
          imageUrl={experience.image_url}
          imageAlt={experience.image_alt}
          className="h-14 w-14 rounded-lg"
          sizes="56px"
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
                className="task-checkbox pointer-events-auto relative z-20 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 disabled:pointer-events-none disabled:opacity-60"
              >
                <Check className="task-checkmark h-3 w-3" strokeWidth={3} />
              </button>
            )}

            <span className="task-title-wrap">
              <span className="task-title text-sm font-semibold text-ink">
                {experience.title}
              </span>

              <span aria-hidden="true" className="task-strike-line" />
            </span>
          </div>

          <div
            className={[
              "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1",
              guest ? "" : "pl-8",
            ].join(" ")}
          >
            {experience.category && (
              <span className="rounded-md border border-border bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">
                {experience.category}
              </span>
            )}

            <span
              className="flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: difficulty.color }}
            >
              <Sparkles className="h-3 w-3" />
              {difficulty.label} · {difficulty.xp} XP
            </span>

            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Users className="h-3 w-3" />
              {adoption} added · {completions} completed
            </span>
          </div>
        </div>

        {guest && onGuestSave && (
          <button
            type="button"
            onClick={onGuestSave}
            aria-label={`Save ${experience.title}`}
            className="pointer-events-auto relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        )}

        {!guest && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${experience.title} from My List`}
            className="pointer-events-auto relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-accent transition-colors hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
          >
            <Bookmark className="h-4 w-4" fill="currentColor" />
          </button>
        )}
      </div>
    </li>
  );
}
