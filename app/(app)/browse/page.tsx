import { createClient } from "@/utils/supabase/server";
import { BrowseBoard } from "./BrowseBoard";

export default async function BrowsePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, title, category")
    .order("created_at", { ascending: false });

  let completedIds: string[] = [];
  let profileName = "Guest";

  if (user) {
    const [{ data: mine }, { data: profile }] = await Promise.all([
      supabase
        .from("user_lists")
        .select("experience_id")
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", user.id)
        .single(),
    ]);
    completedIds = (mine ?? []).map((row) => row.experience_id);
    profileName = profile?.display_name || profile?.username || "You";
  }

  return (
    <BrowseBoard
      experiences={experiences ?? []}
      completedIds={completedIds}
      profileName={profileName}
      signedIn={!!user}
    />
  );
}
