"use client";

import { useState, useTransition } from "react";
import { TaskRow } from "@/app/(app)/browse/components/TaskRow";
import { setListStatus, removeFromMyList } from "@/app/(app)/browse/actions";
import type { Experience, ListStatus } from "@/app/(app)/browse/types";

const TABS: { key: ListStatus; label: string }[] = [
  { key: "saved", label: "Want to do" },
  { key: "completed", label: "Completed" },
];

const ANIMATION_DELAY_MS = 700;

interface Row {
  experience: Experience;
  status: ListStatus;
}

export function MyListBoard({
  saved,
  completed,
}: {
  saved: Experience[];
  completed: Experience[];
}) {
  const [tab, setTab] = useState<ListStatus>("saved");
  const [rows, setRows] = useState<Row[]>(() => [
    ...saved.map((experience) => ({ experience, status: "saved" as const })),
    ...completed.map((experience) => ({
      experience,
      status: "completed" as const,
    })),
  ]);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  function toggle(id: string, currentStatus: ListStatus) {
    const nextStatus: ListStatus =
      currentStatus === "saved" ? "completed" : "saved";

    setPending((prev) => new Set(prev).add(id));
    startTransition(() => {
      setListStatus(id, nextStatus);
    });

    setTimeout(() => {
      setRows((prev) =>
        prev.map((row) =>
          row.experience.id === id ? { ...row, status: nextStatus } : row,
        ),
      );
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, ANIMATION_DELAY_MS);
  }

  function remove(id: string) {
    setRows((prev) => prev.filter((row) => row.experience.id !== id));
    startTransition(() => {
      removeFromMyList(id);
    });
  }

  const visible = rows.filter((row) => row.status === tab);
  const savedCount = rows.filter((row) => row.status === "saved").length;
  const completedCount = rows.filter(
    (row) => row.status === "completed",
  ).length;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sticky top-16 z-10 flex flex-col gap-3 border-b border-border bg-background/95 py-4 backdrop-blur">
        <h1 className="text-xl font-extrabold text-ink">My List</h1>

        <div
          role="tablist"
          aria-label="My List sections"
          className="flex w-fit gap-1 rounded-full border border-border bg-white p-1"
        >
          {TABS.map(({ key, label }) => {
            const count = key === "saved" ? savedCount : completedCount;
            const selected = tab === key;

            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(key)}
                className={`h-8 rounded-full px-3 text-xs font-semibold transition-colors ${
                  selected
                    ? "bg-accent text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          {tab === "saved"
            ? "Nothing saved yet. Add tasks from Browse to see them here."
            : "Nothing completed yet."}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((row) => {
            const isPending = pending.has(row.experience.id);
            const actualDone = row.status === "completed";
            const done = isPending ? !actualDone : actualDone;

            return (
              <TaskRow
                key={row.experience.id}
                experience={row.experience}
                done={done}
                onToggle={() => toggle(row.experience.id, row.status)}
                onRemove={() => remove(row.experience.id)}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
