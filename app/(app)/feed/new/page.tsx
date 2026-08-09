import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loginHrefWithNext } from "@/lib/auth-redirect";
import { PageShell } from "@/components/ui";
import { NewPostForm } from "./components/NewPostForm";

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(loginHrefWithNext("/feed/new"));
  }

  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, title")
    .order("title", { ascending: true });

  return (
    <div>
      <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Feed
        </Link>
      </div>

      <PageShell
        title="Create post"
        subtitle="Ask a question, share a tip, or tell the community about an experience."
      >
        <NewPostForm experiences={experiences ?? []} />
      </PageShell>
    </div>
  );
}
