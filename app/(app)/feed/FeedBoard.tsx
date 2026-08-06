"use client";

import { useMemo, useState } from "react";
import { FilterGroup } from "@/app/(app)/browse/components/FilterGroup";
import { PostCard } from "./components/PostCard";
import type { FeedPost } from "./types";

const FILTERS = ["Latest", "Popular", "Questions", "Tips", "Experiences"] as const;
type Filter = (typeof FILTERS)[number];

export function FeedBoard({ posts }: { posts: FeedPost[] }) {
  const [filter, setFilter] = useState<Filter>("Latest");

  const visible = useMemo(() => {
    switch (filter) {
      case "Popular":
        return [...posts].sort((a, b) => b.upvotes - a.upvotes);
      case "Questions":
        return posts.filter((post) => post.type === "question");
      case "Tips":
        return posts.filter((post) => post.type === "tip");
      case "Experiences":
        return posts.filter((post) => post.type === "experience");
      case "Latest":
      default:
        return posts;
    }
  }, [posts, filter]);

  return (
    <div>
      <FilterGroup
        label="Feed filters"
        options={FILTERS}
        value={filter}
        onChange={setFilter}
        className="flex flex-wrap gap-2"
        buttonClassName="h-8"
        inactiveClassName="bg-white border border-border text-muted hover:text-ink"
      />

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          Nothing here yet.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
