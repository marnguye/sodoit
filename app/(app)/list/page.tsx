import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginHrefWithNext } from "@/lib/auth-redirect";
import { loadMyList } from "./data";
import { MyListBoard } from "./MyListBoard";

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
          href={loginHrefWithNext("/list")}
          className="mt-4 inline-block text-accent font-semibold text-sm hover:text-accent-dark transition-colors"
        >
          Log in →
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.username) {
    redirect(`/u/${profile.username}?view=list`);
  }

  const { saved, completed } = await loadMyList(user.id);

  return <MyListBoard saved={saved} completed={completed} />;
}
