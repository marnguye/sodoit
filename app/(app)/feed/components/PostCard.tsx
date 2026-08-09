import Link from "next/link";
import { Bookmark, ChevronRight, Heart, MessageCircle } from "lucide-react";
import { getTaskMeta } from "@/app/(app)/browse/types";
import { Avatar, Badge, Card } from "@/components/ui";
import { relativeTime } from "../types";
import type { FeedPost, PostType } from "../types";

const TYPE_LABEL: Record<PostType, string> = {
  question: "Question",
  tip: "Tip",
  experience: "Experience",
};

const TYPE_VARIANT: Record<PostType, "purple" | "success" | "blue"> = {
  question: "purple",
  tip: "success",
  experience: "blue",
};

const ACTION_CLASS =
  "pointer-events-auto relative z-10 inline-flex h-8 items-center gap-1.5 rounded-lg bg-background px-2.5 text-xs font-semibold text-ink/80 transition-colors hover:bg-accent-light hover:text-accent-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

export function PostCard({ post }: { post: FeedPost }) {
  const thumbnail = post.experience
    ? getTaskMeta(post.experience.id).thumbnail
    : null;

  return (
    <li>
      <Card className="group relative rounded-xl p-4 transition-colors hover:border-accent">
        <Link
          href={`/posts/${post.id}`}
          aria-label={`Open post: ${post.title}`}
          className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        />

        <article className="pointer-events-none relative">
          <header className="flex items-center gap-2">
            <Avatar name={post.authorName} size="sm" />
            <span className="truncate text-sm font-semibold text-ink">
              {post.authorName}
            </span>
            <span aria-hidden="true" className="text-xs text-muted">
              ·
            </span>
            <time
              dateTime={post.createdAt}
              className="shrink-0 text-xs text-muted"
            >
              {relativeTime(post.createdAt)}
            </time>
            <Badge variant={TYPE_VARIANT[post.type]} className="shrink-0">
              {TYPE_LABEL[post.type]}
            </Badge>
          </header>

          <div className="mt-3">
            <h2 className="text-lg font-extrabold leading-snug text-ink transition-colors group-hover:text-accent-dark">
              {post.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted">
              {post.body}
            </p>
          </div>

          {post.experience && thumbnail && (
            <Link
              href={`/tasks/${post.experience.id}`}
              aria-label={`Open experience: ${post.experience.title}`}
              className="pointer-events-auto relative z-10 mt-3 flex items-center gap-2.5 rounded-xl bg-background p-2.5 transition-colors hover:bg-accent-light"
            >
              <span
                aria-hidden="true"
                className="h-11 w-11 shrink-0 rounded-lg"
                style={{ backgroundColor: thumbnail }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">
                  {post.experience.title}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-muted">
                  {post.experience.category ?? "Experience"}
                </span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-muted"
              />
            </Link>
          )}

          <footer className="mt-3 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-label={`Mark ${post.title} as helpful`}
              className={ACTION_CLASS}
            >
              <Heart aria-hidden="true" className="h-4 w-4" />
              Helpful · {post.helpfulCount}
            </button>
            <button
              type="button"
              aria-label={`View comments on ${post.title}`}
              className={ACTION_CLASS}
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" />
              Comments · {post.commentCount}
            </button>
            <button
              type="button"
              aria-label={`Save ${post.title}`}
              className={`${ACTION_CLASS} ml-auto`}
            >
              <Bookmark aria-hidden="true" className="h-4 w-4" />
              Save
            </button>
          </footer>
        </article>
      </Card>
    </li>
  );
}
