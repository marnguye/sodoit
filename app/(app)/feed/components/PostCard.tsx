import Link from "next/link";
import { ArrowUp, MessageCircle } from "lucide-react";
import { Avatar, Badge } from "@/components/ui";
import { relativeTime } from "../types";
import type { FeedPost, PostType } from "../types";

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

function preview(body: string, max = 140): string {
  const trimmed = body.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <li className="relative rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent">
      <Link
        href={`/posts/${post.id}`}
        aria-label={post.title}
        className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
      />

      <div className="pointer-events-none flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Avatar name={post.authorName} size="sm" />
          <span className="text-sm font-semibold text-ink">
            {post.authorName}
          </span>
          <span className="text-xs text-muted">
            {relativeTime(post.createdAt)}
          </span>
          <Badge variant={TYPE_VARIANT[post.type]}>
            {TYPE_LABEL[post.type]}
          </Badge>
        </div>

        {post.experience && (
          <Link
            href={`/tasks/${post.experience.id}`}
            className="pointer-events-auto relative z-10 w-fit rounded-md border border-border bg-white px-2 py-0.5 text-[11px] font-semibold text-muted transition-colors hover:text-accent"
          >
            {post.experience.title}
          </Link>
        )}

        <h2 className="text-base font-bold text-ink">{post.title}</h2>
        <p className="text-sm text-muted leading-relaxed">
          {preview(post.body)}
        </p>

        <div className="mt-1 flex items-center gap-4 text-xs font-semibold text-muted">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3.5 w-3.5" />
            {post.upvotes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </li>
  );
}
