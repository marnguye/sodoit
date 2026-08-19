import { EmptyState } from "@/components/ui";
import type { ActivityFeedResult, ActivityFilter } from "@/app/(app)/feed/data";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityListItem } from "./ActivityListItem";
import { ActivityPagination } from "./ActivityPagination";

interface ActivityFeedProps {
  filter: ActivityFilter;
  result: ActivityFeedResult;
  viewerStatuses: Map<string, "saved" | "completed">;
  signedIn: boolean;
}

export function ActivityFeed({
  filter,
  result,
  viewerStatuses,
  signedIn,
}: ActivityFeedProps) {
  return (
    <div>
      <ActivityFilters active={filter} />

      {result.items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No community updates yet"
            description="When people share their lists, complete experiences, or create public collections, you'll see it here."
          />
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {result.items.map((item) => (
            <li key={item.id}>
              <ActivityListItem
                item={item}
                viewerStatus={
                  item.kind === "completed" || item.kind === "added_to_list"
                    ? (viewerStatuses.get(item.experience.id) ?? null)
                    : null
                }
                signedIn={signedIn}
              />
            </li>
          ))}
        </ul>
      )}

      <ActivityPagination
        filter={filter}
        page={result.page}
        hasMore={result.hasMore}
      />
    </div>
  );
}
