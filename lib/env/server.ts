import "server-only";
import { requireEnv } from "./validate";

export const serverEnv = Object.freeze({
  get supabaseUrl(): string {
    return requireEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
  },

  get supabaseServiceRoleKey(): string {
    return requireEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  },
});
