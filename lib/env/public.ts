import { requireEnv } from "./validate";

export const publicEnv = Object.freeze({
  supabaseUrl: requireEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),

  supabaseAnonKey: requireEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),

  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined,
});
