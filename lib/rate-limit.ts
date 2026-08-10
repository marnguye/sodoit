import type { SupabaseClient } from "@supabase/supabase-js";

export type RateLimitAction = "create_post" | "create_comment";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export async function consumeRateLimit(
  supabase: SupabaseClient,
  action: RateLimitAction,
): Promise<RateLimitResult> {
  const { data, error } = await supabase
    .rpc("consume_rate_limit", { p_action: action })
    .single<{ allowed: boolean; retry_after_seconds: number }>();

  if (error || !data) {
    throw new Error("Rate limit check failed.");
  }

  return {
    allowed: data.allowed,
    retryAfterSeconds: data.retry_after_seconds,
  };
}
