import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { AchievementUnlockProvider } from "./achievements/components/AchievementUnlockProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    username = profile?.username ?? null;
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <div>
      <Header
        signedIn={Boolean(user)}
        username={username}
        avatarUrl={avatarUrl}
      />

      <main className="min-h-screen bg-background px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <AchievementUnlockProvider>{children}</AchievementUnlockProvider>
      </main>
    </div>
  );
}
