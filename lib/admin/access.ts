import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminAccess =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "ok"; userId: string };

export async function getAdminAccess(
  supabase: Pick<SupabaseClient, "auth" | "from">,
): Promise<AdminAccess> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "unauthenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return { status: "forbidden" };

  return { status: "ok", userId: user.id };
}
