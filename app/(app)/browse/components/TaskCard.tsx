"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, Users } from "lucide-react";
import type { Experience } from "../types";
import { hashString } from "../types";

const DIFFICULTIES = [
  { label: "Easy", xp: 10, color: "#16A34A" },
  { label: "Medium", xp: 25, color: "#F97316" },
  { label: "Hard", xp: 50, color: "#DC2626" },
] as const;

const THUMBNAIL_HUES = [
  "#FED7AA",
  "#BAE6FD",
  "#BBF7D0",
  "#E9D5FF",
  "#FECACA",
] as const;

interface TaskCardProps {
  experience: Experience;
  done: boolean;
  onToggle: () => void;
}

export function TaskCard({ experience, done, onToggle }: TaskCardProps) {
  const [prevDone, setPrevDone] = useState(done);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const hash = hashString(experience.id);
  const difficulty = DIFFICULTIES[hash % DIFFICULTIES.length];
  const thumbnail = THUMBNAIL_HUES[hash % THUMBNAIL_HUES.length];
  const adoption = 50 + (hash % 950);
  const completions = Math.floor(adoption * (0.2 + (hash % 50) / 100));

  if (prevDone !== done) {
    setPrevDone(done);
    setIsCelebrating(done);
  }

  useEffect(() => {
    if (!isCelebrating) return;

    const timeout = setTimeout(() => setIsCelebrating(false), 650);
    return () => clearTimeout(timeout);
  }, [isCelebrating]);

  return (
    <li
      className={[
        "task-card rounded-xl",
        done ? "is-done" : "",
        isCelebrating ? "is-celebrating" : "",
      ].join(" ")}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`${done ? "Mark as incomplete" : "Mark as complete"}: ${
          experience.title
        }`}
        onClick={onToggle}
        className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors duration-200 hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
      >
        <span
          aria-hidden="true"
          className="h-14 w-14 shrink-0 rounded-lg"
          style={{ backgroundColor: thumbnail }}
        />

        <div className="min-w-0 flex-1">
          <div className="task-check-track flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="task-checkbox shrink-0">
              <Check className="task-checkmark h-3 w-3" strokeWidth={3} />
            </span>

            <span className="task-title-wrap">
              <span className="task-title text-sm font-semibold text-ink">
                {experience.title}
              </span>

              <span aria-hidden="true" className="task-strike-line" />
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-8">
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
      </button>
    </li>
  );
}
