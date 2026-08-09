import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/ui";
import { ProfileForm } from "./components/ProfileForm";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <PageShell
      title="Edit profile"
      subtitle="Update how you appear to others."
      maxWidth="560px"
    >
      <ProfileForm
        userId={user.id}
        initialUsername={profile?.username ?? ""}
        initialBio={profile?.bio ?? ""}
        initialAvatarUrl={profile?.avatar_url ?? null}
      />
    </PageShell>
  );
}
