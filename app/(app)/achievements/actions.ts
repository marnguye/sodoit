"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

interface ClaimedAchievement {
  achievement_id: string;
}

export async function checkAndUnlockAchievements(): Promise<string[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return [];

  const { data, error } = await supabase.rpc("claim_achievements");

  if (error) {
    logger.error("achievements.claim.failed", {
      reason: "rpc_error",
    });
    return [];
  }

  return ((data ?? []) as ClaimedAchievement[]).map(
    ({ achievement_id }) => achievement_id,
  );
}
