"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { createElement, useCallback, useEffect, useState } from "react";
import { getAchievementIcon, type AchievementDefinition } from "../data";

interface AchievementUnlockProps {
  achievementId: string;
  definitions: AchievementDefinition[];
  onClose: () => void;
}

const DISPLAY_DURATION = 5000;
const EXIT_DURATION = 220;

export function AchievementUnlock({
  achievementId,
  definitions,
  onClose,
}: AchievementUnlockProps) {
  const [isClosing, setIsClosing] = useState(false);

  const milestone = definitions.find((item) => item.id === achievementId);

  const close = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);

    window.setTimeout(() => {
      onClose();
    }, EXIT_DURATION);
  }, [isClosing, onClose]);

  useEffect(() => {
    const timeout = window.setTimeout(close, DISPLAY_DURATION);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [close]);

  if (!milestone) {
    return null;
  }

  const Icon = getAchievementIcon(milestone.icon);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`achievement-toast fixed right-5 top-20 z-[100] w-[340px] max-w-[calc(100vw-2rem)] ${
        isClosing ? "achievement-toast-out" : ""
      }`}
    >
      <div className="relative rounded-xl border border-border bg-white p-4 shadow-lg">
        <button
          type="button"
          onClick={close}
          aria-label="Close achievement"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-3 pr-6">
          <div className="achievement-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent-dark">
            {createElement(Icon, { className: "h-5 w-5" })}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
              Achievement unlocked
            </p>

            <p className="mt-1 text-sm font-bold text-ink">{milestone.title}</p>

            <p className="mt-1 text-xs leading-5 text-muted">
              {milestone.description}
            </p>

            <Link
              href="/achievements"
              onClick={onClose}
              className="mt-2 inline-flex text-xs font-semibold text-accent hover:text-accent-dark"
            >
              View achievement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
