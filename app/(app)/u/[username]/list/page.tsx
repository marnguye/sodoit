import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui";
import { loadPublicList } from "@/app/(app)/list/collections/data";
import { loadMyList } from "@/app/(app)/list/data";
import { PublicListView } from "./PublicListView";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await loadPublicList(username);

  if (!result || result.visibility !== "public") {
    return { robots: { index: false, follow: false } };
  }

  return {
    title: `${result.profile.username}'s list`,
    description: `Experiences saved and completed by ${result.profile.username}.`,
    robots: { index: true, follow: true },
  };
}

export default async function PublicListPage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await loadPublicList(username);
  if (!result) notFound();

  const isOwner = user?.id === result.profile.id;

  if (result.visibility !== "public" && !isOwner) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title="This list isn't public." />
      </div>
    );
  }

  const { saved, completed } = isOwner
    ? await loadMyList(result.profile.id)
    : result;

  return (
    <PublicListView
      username={result.profile.username}
      isOwner={isOwner}
      saved={saved}
      completed={completed}
    />
  );
}
