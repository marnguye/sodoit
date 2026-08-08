"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AchievementUnlock } from "./AchievementUnlock";

interface AchievementUnlockContextValue {
  showAchievements: (achievementIds: string[]) => void;
}

const AchievementUnlockContext =
  createContext<AchievementUnlockContextValue | null>(null);

export function AchievementUnlockProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [queue, setQueue] = useState<string[]>([]);

  const showAchievements = useCallback((achievementIds: string[]) => {
    if (achievementIds.length === 0) {
      return;
    }

    setQueue((current) => [
      ...current,
      ...achievementIds.filter((id) => !current.includes(id)),
    ]);
  }, []);

  const handleClose = useCallback(() => {
    setQueue((current) => current.slice(1));
  }, []);

  const value = useMemo(
    () => ({
      showAchievements,
    }),
    [showAchievements],
  );

  const activeAchievement = queue[0];

  return (
    <AchievementUnlockContext.Provider value={value}>
      {children}

      {activeAchievement && (
        <AchievementUnlock
          achievementId={activeAchievement}
          onClose={handleClose}
        />
      )}
    </AchievementUnlockContext.Provider>
  );
}

export function useAchievementUnlock() {
  const context = useContext(AchievementUnlockContext);

  if (!context) {
    throw new Error(
      "useAchievementUnlock must be used inside AchievementUnlockProvider",
    );
  }

  return context;
}
