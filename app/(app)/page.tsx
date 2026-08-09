import { createClient } from "@/lib/supabase/server";
import { BrowseBoard } from "./browse/BrowseBoard";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, title, category, description, difficulty, image_url, image_alt")
    .order("created_at", { ascending: false });

  let completedIds: string[] = [];

  if (user) {
    const { data: completed } = await supabase
      .from("user_lists")
      .select("experience_id")
      .eq("user_id", user.id)
      .eq("status", "completed");

    completedIds = (completed ?? []).map((row) => row.experience_id);
  }

  return (
    <BrowseBoard
      experiences={experiences ?? []}
      completedIds={completedIds}
      signedIn={Boolean(user)}
    />
  );
}
