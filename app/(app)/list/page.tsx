import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import type { Experience, ListStatus } from "@/app/(app)/browse/types";
import { MyListBoard } from "./MyListBoard";

interface ListRow {
  id: string;
  status: ListStatus;
  experiences: Experience | Experience[] | null;
}

function toExperience(
  value: Experience | Experience[] | null,
): Experience | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function MyListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-xl font-extrabold text-ink">My List</h1>
        <p className="mt-3 rounded-xl border border-dashed border-border p-8 text-sm text-muted">
          Log in to see the experiences you&apos;ve saved and completed.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-accent font-semibold text-sm hover:text-accent-dark transition-colors"
        >
          Log in →
        </Link>
      </div>
    );
  }

  const { data: rows } = (await supabase
    .from("user_lists")
    .select("id, status, experiences(id, title, category)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })) as { data: ListRow[] | null };

  const saved: Experience[] = [];
  const completed: Experience[] = [];

  for (const row of rows ?? []) {
    const experience = toExperience(row.experiences);
    if (!experience) continue;
    if (row.status === "saved") saved.push(experience);
    else if (row.status === "completed") completed.push(experience);
  }

  return <MyListBoard saved={saved} completed={completed} />;
}
