import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Heart, MessageCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Avatar, Badge, Card, ErrorState } from "@/components/ui";
import { relativeTime } from "@/app/(app)/feed/types";
import type { PostType } from "@/app/(app)/feed/types";

import { CommentForm } from "./CommentForm";

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

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[800px]">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        {children}
      </div>
    </main>
  );
}

function ErrorFrame() {
  return (
    <PageFrame>
      <div className="mt-6">
        <ErrorState
          title="Could not load this post"
          description="Something went wrong while loading the conversation."
        />
      </div>
    </PageFrame>
  );
}

function CommentCard({
  author,
  body,
  createdAt,
}: {
  author: string;
  body: string;
  createdAt: string;
}) {
  return (
    <div className="flex gap-3 py-4">
      <Avatar name={author} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{author}</span>

          <span className="text-xs text-muted">{relativeTime(createdAt)}</span>
        </div>

        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-ink/80">
          {body}
        </p>
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

  const [postResult, authResult] = await Promise.all([
    supabase
      .from("posts")
      .select("id, author_id, experience_id, type, title, body, created_at")
      .eq("id", id)
      .maybeSingle(),

    supabase.auth.getUser(),
  ]);

  if (postResult.error) {
    return <ErrorFrame />;
  }

  const post = postResult.data as PostDetailRow | null;

  if (!post) {
    notFound();
  }

  const user = authResult.data.user;

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
      : Promise.resolve({
          data: null,
          error: null,
        }),
  ]);

  if (commentsResult.error || votesResult.error || experienceResult.error) {
    return <ErrorFrame />;
  }

  const comments = (commentsResult.data ?? []) as CommentRow[];

  const authorIds = [
    ...new Set([
      post.author_id,
      ...comments.map((comment) => comment.author_id),
    ]),
  ];

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", authorIds);

  if (profilesError) {
    return <ErrorFrame />;
  }

  const authorNames = new Map(
    ((profilesData ?? []) as ProfileRow[]).map((profile) => [
      profile.id,
      profile.username,
    ]),
  );

  const author = authorNames.get(post.author_id) ?? "Someone";

  const experience = experienceResult.data as ExperienceRow | null;

  return (
    <PageFrame>
      <article className="mt-5">
        <Card className="flex flex-col gap-4 p-6">
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

          <div>
            <h1 className="text-xl font-extrabold leading-tight text-ink">
              {post.title}
            </h1>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/80">
              {post.body}
            </p>
          </div>

          {experience && (
            <Link
              href={`/tasks/${experience.id}`}
              className="w-fit rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-accent/30 hover:text-accent"
            >
              {experience.title}
            </Link>
          )}

          <div className="flex items-center gap-5 border-t border-border pt-4 text-sm font-medium text-muted">
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              Helpful {votesResult.count ?? 0}
            </span>

            <a
              href="#comments"
              className="flex items-center gap-1.5 transition-colors hover:text-ink"
            >
              <MessageCircle className="h-4 w-4" />
              Comments {comments.length}
            </a>
          </div>
        </Card>
      </article>

      <section id="comments" className="mt-8 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Comments</h2>

          <span className="text-sm text-muted">{comments.length}</span>
        </div>

        <div className="mt-4">
          <CommentForm postId={post.id} signedIn={Boolean(user)} />
        </div>

        {comments.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm font-semibold text-ink">No comments yet</p>

            <p className="mt-1 text-sm text-muted">
              Be the first to join the conversation.
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {comments.map((comment) => (
              <li key={comment.id}>
                <CommentCard
                  author={authorNames.get(comment.author_id) ?? "Someone"}
                  body={comment.body}
                  createdAt={comment.created_at}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageFrame>
  );
}
