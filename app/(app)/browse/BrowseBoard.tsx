"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceHeader } from "./components/MarketplaceHeader";
import { TaskCard } from "./components/TaskCard";
import { addToList, removeFromList } from "./actions";
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
    setCompleted((prev) => {
      const next = new Set(prev);
      const wasDone = next.has(id);
      if (wasDone) next.delete(id);
      else next.add(id);

      startTransition(() => {
        if (wasDone) removeFromList(id);
        else addToList(id);
      });

      return next;
    });
  }

  return (
    <div className="-m-8 flex">
      <div className="flex-1 min-w-0">
        <MarketplaceHeader
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

        <div className="px-8 py-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted text-center py-16">
              Nothing matches. Try a different search or filter.
            </p>
          ) : (
            <ul className="flex flex-col gap-1 py-3">
              {filtered.map((exp) => (
                <TaskCard
                  key={exp.id}
                  experience={exp}
                  done={completed.has(exp.id)}
                  onToggle={() => toggle(exp.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
