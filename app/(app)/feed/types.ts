export type PostType = "question" | "tip" | "experience";

export const POST_TYPES: readonly PostType[] = [
  "question",
  "tip",
  "experience",
];

export interface FeedPost {
  id: string;
  type: PostType;
  title: string;
  body: string;
  createdAt: string;
  authorName: string;
  experience: { id: string; title: string } | null;
  upvotes: number;
  commentCount: number;
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
