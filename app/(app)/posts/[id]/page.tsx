import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ArrowUp, MessageCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Avatar, Badge, Card, ErrorState } from "@/components/ui";
import { relativeTime } from "@/app/(app)/feed/types";
import type { PostType } from "@/app/(app)/feed/types";

interface PostDetailRow {
  id: string;
  author_id: string;
  experience_id: string | null;
  type: PostType;
  title: string;
  body: string;
  created_at: string;
}

interface CommentRow {
  id: string;
  author_id: string;
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

const TYPE_LABEL: Record<PostType, string> = {
  question: "Question",
  tip: "Tip",
  experience: "Experience",
};

const TYPE_VARIANT: Record<PostType, "default" | "success" | "accent"> = {
  question: "default",
  tip: "success",
  experience: "accent",
};

function BackToFeed() {
  return (
    <Link
      href="/feed"
      className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink transition-colors"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to Feed
    </Link>
  );
}

function PostErrorState() {
  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <BackToFeed />
      <div className="mt-4">
        <ErrorState
          title="Couldn't load this post"
          description="Please try again shortly."
        />
      </div>
    </div>
  );
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post, error: postError } = (await supabase
    .from("posts")
    .select("id, author_id, experience_id, type, title, body, created_at")
    .eq("id", id)
    .maybeSingle()) as {
    data: PostDetailRow | null;
    error: { message: string } | null;
  };

  if (postError) {
    return <PostErrorState />;
  }

  if (!post) {
    notFound();
  }

  const [commentsResult, votesResult, experienceResult] = await Promise.all([
    supabase
      .from("comments")
      .select("id, author_id, body, created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("post_votes")
      .select("id", { count: "exact", head: true })
      .eq("post_id", id),
    post.experience_id
      ? supabase
          .from("experiences")
          .select("id, title")
          .eq("id", post.experience_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (commentsResult.error || votesResult.error || experienceResult.error) {
    return <PostErrorState />;
  }

  const comments = (commentsResult.data ?? []) as CommentRow[];
  const authorIds = [
    ...new Set([post.author_id, ...comments.map((comment) => comment.author_id)]),
  ];
  const profilesResult = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", authorIds);

  if (profilesResult.error) {
    return <PostErrorState />;
  }

  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const authorNames = new Map(
    profiles.map((profile) => [profile.id, profile.username]),
  );
  const author = authorNames.get(post.author_id) ?? "Someone";
  const experience = experienceResult.data as ExperienceRow | null;

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <BackToFeed />

      <Card className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Avatar name={author} size="sm" />
          <span className="text-sm font-semibold text-ink">{author}</span>
          <span className="text-xs text-muted">
            {relativeTime(post.created_at)}
          </span>
          <Badge variant={TYPE_VARIANT[post.type]}>
            {TYPE_LABEL[post.type]}
          </Badge>
        </div>

        {experience && (
          <Link
            href={`/tasks/${experience.id}`}
            className="w-fit rounded-md border border-border bg-white px-2 py-0.5 text-[11px] font-semibold text-muted transition-colors hover:text-accent"
          >
            {experience.title}
          </Link>
        )}

        <h1 className="text-xl font-extrabold text-ink">{post.title}</h1>
        <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
          {post.body}
        </p>

        <div className="mt-1 flex items-center gap-4 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3.5 w-3.5" />
            {votesResult.count ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {comments.length}
          </span>
        </div>
      </Card>

      <h2 className="mt-8 text-sm font-bold text-ink">
        Comments ({comments.length})
      </h2>

      {comments.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
          No comments yet.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {comments.map((comment) => {
            const commentAuthor =
              authorNames.get(comment.author_id) ?? "Someone";

            return (
              <li key={comment.id}>
                <Card className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={commentAuthor} size="sm" />
                    <span className="text-sm font-semibold text-ink">
                      {commentAuthor}
                    </span>
                    <span className="text-xs text-muted">
                      {relativeTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                    {comment.body}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
