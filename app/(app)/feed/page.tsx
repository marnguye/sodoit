import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { PageShell, ErrorState, EmptyState } from "@/components/ui";
import type { FeedPost, PostType } from "./types";
import { FeedBoard } from "./FeedBoard";

interface PostRow {
  id: string;
  author_id: string;
  experience_id: string | null;
  type: PostType;
  title: string;
  body: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  username: string;
}

interface ExperienceRow {
  id: string;
  title: string;
}

interface PostReferenceRow {
  post_id: string;
}

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: rows, error } = (await supabase
    .from("posts")
    .select("id, author_id, experience_id, type, title, body, created_at")
    .order("created_at", { ascending: false })) as {
    data: PostRow[] | null;
    error: { message: string } | null;
  };

  const actions = (
    <Link
      href="/feed/new"
      className="inline-flex items-center gap-1 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
    >
      Create post
    </Link>
  );

  if (error) {
    return (
      <PageShell
        title="Community Feed"
        subtitle="Questions, tips, and real experiences from the community."
        actions={actions}
      >
        <ErrorState
          title="Couldn't load the Feed"
          description="Please try again shortly."
        />
      </PageShell>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <PageShell
        title="Community Feed"
        subtitle="Questions, tips, and real experiences from the community."
        actions={actions}
      >
        <EmptyState
          title="No posts yet"
          description="Be the first to ask a question, share a tip, or post about an experience."
          action={
            <Link
              href="/feed/new"
              className="text-accent font-semibold text-sm hover:text-accent-dark transition-colors"
            >
              Create the first post →
            </Link>
          }
        />
      </PageShell>
    );
  }

  const postIds = rows.map((row) => row.id);
  const authorIds = [...new Set(rows.map((row) => row.author_id))];
  const experienceIds = [
    ...new Set(
      rows.flatMap((row) => (row.experience_id ? [row.experience_id] : [])),
    ),
  ];

  const [profilesResult, experiencesResult, votesResult, commentsResult] =
    await Promise.all([
      supabase.from("profiles").select("id, username").in("id", authorIds),
      experienceIds.length
        ? supabase
            .from("experiences")
            .select("id, title")
            .in("id", experienceIds)
        : Promise.resolve({ data: [], error: null }),
      supabase.from("post_votes").select("post_id").in("post_id", postIds),
      supabase.from("comments").select("post_id").in("post_id", postIds),
    ]);

  if (
    profilesResult.error ||
    experiencesResult.error ||
    votesResult.error ||
    commentsResult.error
  ) {
    return (
      <PageShell
        title="Community Feed"
        subtitle="Questions, tips, and real experiences from the community."
        actions={actions}
      >
        <ErrorState
          title="Couldn't load the Feed"
          description="Please try again shortly."
        />
      </PageShell>
    );
  }

  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const experiences = (experiencesResult.data ?? []) as ExperienceRow[];
  const votes = (votesResult.data ?? []) as PostReferenceRow[];
  const comments = (commentsResult.data ?? []) as PostReferenceRow[];
  const authorNames = new Map(
    profiles.map((profile) => [profile.id, profile.username]),
  );
  const experienceById = new Map(
    experiences.map((experience) => [experience.id, experience]),
  );

  const voteCounts = new Map<string, number>();
  for (const vote of votes) {
    voteCounts.set(vote.post_id, (voteCounts.get(vote.post_id) ?? 0) + 1);
  }

  const commentCounts = new Map<string, number>();
  for (const comment of comments) {
    commentCounts.set(
      comment.post_id,
      (commentCounts.get(comment.post_id) ?? 0) + 1,
    );
  }

  const posts: FeedPost[] = rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    authorName: authorNames.get(row.author_id) ?? "Someone",
    experience: row.experience_id
      ? (experienceById.get(row.experience_id) ?? null)
      : null,
    upvotes: voteCounts.get(row.id) ?? 0,
    commentCount: commentCounts.get(row.id) ?? 0,
  }));

  return (
    <PageShell
      title="Community Feed"
      subtitle="Questions, tips, and real experiences from the community."
      actions={actions}
    >
      <FeedBoard posts={posts} />
    </PageShell>
  );
}
