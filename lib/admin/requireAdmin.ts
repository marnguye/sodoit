import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccess } from "./access";

export type RequireAdminResult =
  { ok: true; userId: string } | { ok: false; error: string };

export async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createClient();
  const access = await getAdminAccess(supabase);

  if (access.status === "unauthenticated") {
    return { ok: false, error: "You must be signed in." };
  }

  if (access.status === "forbidden") {
    return { ok: false, error: "Admin access required." };
  }

  return { ok: true, userId: access.userId };
}
