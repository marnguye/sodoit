import Link from "next/link";
import { Globe2, Lock } from "lucide-react";

import { EmptyState } from "@/components/ui";
import type { Collection } from "@/app/(app)/list/collections/types";

export function ProfileCollections({
  username,
  collections,
  isOwner,
}: {
  username: string;
  collections: Collection[];
  isOwner: boolean;
}) {
  if (collections.length === 0) {
    return (
      <EmptyState
        title={isOwner ? "No collections yet" : "No public collections yet"}
      />
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {collections.map((collection) => (
        <li key={collection.id}>
          <Link
            href={`/u/${username}/collections/${collection.slug}`}
            className="flex items-center justify-between gap-3 rounded-control border border-border bg-surface px-3.5 py-3 transition-colors hover:border-border-strong hover:bg-surface-subtle"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">
                {collection.name}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {collection.itemCount} experience
                {collection.itemCount === 1 ? "" : "s"}
              </span>
            </span>

            {isOwner && (
              <span
                className="shrink-0 text-muted"
                aria-label={`${collection.visibility === "public" ? "Public" : "Private"} collection`}
              >
                {collection.visibility === "public" ? (
                  <Globe2 aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Lock aria-hidden="true" className="h-4 w-4" />
                )}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
