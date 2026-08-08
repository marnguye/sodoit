import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { relativeTime } from "@/app/(app)/feed/types";
import type { PostType } from "@/app/(app)/feed/types";
import type { ProfilePost } from "../types";

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

export function ProfilePosts({ posts }: { posts: ProfilePost[] }) {
  if (posts.length === 0) {
    return <EmptyState title="No posts shared yet" />;
  }

  return (
    <Card className="p-0">
      <ul className="divide-y divide-border">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/posts/${post.id}`}
              className="group block p-4 transition-colors hover:bg-background"
            >
              <div className="flex items-center gap-2">
                <Badge variant={TYPE_VARIANT[post.type]}>
                  {TYPE_LABEL[post.type]}
                </Badge>
                <span className="text-xs text-muted">
                  {relativeTime(post.createdAt)}
                </span>
              </div>

              <p className="mt-2 line-clamp-1 text-sm font-semibold text-ink group-hover:text-accent-dark">
                {post.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                {post.body}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
