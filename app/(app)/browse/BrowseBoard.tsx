"use client";

import { useMemo, useState, useTransition } from "react";
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
  profileName: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(() => new Set(completedIds));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [, startTransition] = useTransition();

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(experiences.map((e) => e.category).filter(Boolean) as string[]),
      ),
    ],
    [experiences],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return experiences.filter((exp) => {
      if (q && !exp.title.toLowerCase().includes(q)) return false;
      if (category !== "All" && exp.category !== category) return false;
      const isDone = completed.has(exp.id);
      if (status === "completed" && !isDone) return false;
      if (status === "uncompleted" && isDone) return false;
      return true;
    });
  }, [experiences, search, category, status, completed]);

  function toggle(id: string) {
    if (!signedIn) {
      router.push("/login");
      return;
    }

    const wasDone = completed.has(id);

    setCompleted((prev) => {
      const next = new Set(prev);
      if (wasDone) next.delete(id);
      else next.add(id);
      return next;
    });

    startTransition(() => {
      if (wasDone) removeFromMyList(id);
      else setListStatus(id, "completed");
    });
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
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
        <p className="text-sm text-muted text-center py-16">
          Nothing matches. Try a different search or filter.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((exp) => (
            <TaskRow
              key={exp.id}
              experience={exp}
              done={completed.has(exp.id)}
              onToggle={() => toggle(exp.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
