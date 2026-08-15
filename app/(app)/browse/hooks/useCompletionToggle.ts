"use client";

import { useState } from "react";
import { useAchievementUnlock } from "@/app/(app)/achievements/components/AchievementUnlockProvider";
import { checkAndUnlockAchievements } from "@/app/(app)/achievements/actions";

export function useCompletionToggle(
  done: boolean,
  onToggle: () => Promise<void>,
) {
  const { showAchievements } = useAchievementUnlock();
  const [isToggling, setIsToggling] = useState(false);

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

  return { isToggling, handleToggle };
}
