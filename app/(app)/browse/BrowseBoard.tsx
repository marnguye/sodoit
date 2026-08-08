"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowseToolbar } from "./components/BrowseToolbar";
import { TaskRow } from "./components/TaskRow";
import { setListStatus, removeFromMyList } from "./actions";
import type { Experience, StatusFilter } from "./types";

export function BrowseBoard({
  experiences,
  completedIds,
  signedIn,
}: {
  experiences: Experience[];
  completedIds: string[];
  signedIn: boolean;
}) {
  const router = useRouter();

  const [completed, setCompleted] = useState(() => new Set(completedIds));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("all");

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          experiences
            .map((experience) => experience.category)
            .filter(Boolean) as string[],
        ),
      ),
    ],
    [experiences],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return experiences.filter((experience) => {
      if (query && !experience.title.toLowerCase().includes(query)) {
        return false;
      }

      if (category !== "All" && experience.category !== category) {
        return false;
      }

      const isDone = completed.has(experience.id);

      if (status === "completed" && !isDone) {
        return false;
      }

      if (status === "uncompleted" && isDone) {
        return false;
      }

      return true;
    });
  }, [experiences, search, category, status, completed]);

  async function toggle(id: string): Promise<void> {
    if (!signedIn) {
      router.push("/login");
      return;
    }

    const wasDone = completed.has(id);

    setCompleted((previous) => {
      const next = new Set(previous);

      if (wasDone) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

    try {
      if (wasDone) {
        await removeFromMyList(id);
      } else {
        await setListStatus(id, "completed");
      }
    } catch (error) {
      // Roll back optimistic state.
      setCompleted((previous) => {
        const next = new Set(previous);

        if (wasDone) {
          next.add(id);
        } else {
          next.delete(id);
        }

        return next;
      });

      throw error;
    }
  }

  return (
    <div>
      <BrowseToolbar
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        completedCount={completed.size}
        totalCount={experiences.length}
      />

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          Nothing matches. Try a different search or filter.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((experience) => (
            <TaskRow
              key={experience.id}
              experience={experience}
              done={completed.has(experience.id)}
              onToggle={() => toggle(experience.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
