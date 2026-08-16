"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHero, ViewToggle, EmptyState } from "@/components/ui";
import { SearchField } from "@/components/ui/SearchField";
import { FilterGroup } from "@/app/(app)/browse/components/FilterGroup";
import { ExperienceResults } from "@/app/(app)/browse/components/ExperienceResults";
import type {
  BrowseView,
  Experience,
  ListStatus,
} from "@/app/(app)/browse/types";

type PublicListStatus = "all" | ListStatus;

const STATUS_OPTIONS: readonly PublicListStatus[] = [
  "all",
  "saved",
  "completed",
];
const STATUS_LABELS: Record<PublicListStatus, string> = {
  all: "All",
  saved: "Saved",
  completed: "Completed",
};

interface Entry {
  experience: Experience;
  status: ListStatus;
}

interface PublicListViewProps {
  username: string;
  isOwner: boolean;
  saved: Experience[];
  completed: Experience[];
}

export function PublicListView({
  username,
  isOwner,
  saved,
  completed,
}: PublicListViewProps) {
  const router = useRouter();

  const [status, setStatus] = useState<PublicListStatus>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<BrowseView>("grid");

  const entries: Entry[] = [
    ...saved.map((experience) => ({ experience, status: "saved" as const })),
    ...completed.map((experience) => ({
      experience,
      status: "completed" as const,
    })),
  ];

  const completedIds = new Set(completed.map((experience) => experience.id));

  const searched = search.trim()
    ? entries.filter((entry) =>
        entry.experience.title
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      )
    : entries;

  const visible = searched.filter(
    (entry) => status === "all" || entry.status === status,
  );

  async function noop(): Promise<void> {}

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHero
          title={`${username}'s list`}
          subtitle={`${saved.length} saved · ${completed.length} completed`}
        />

        {isOwner && (
          <button
            type="button"
            onClick={() => router.push("/list")}
            className="mt-1 inline-flex h-8 shrink-0 items-center rounded-control border border-border bg-surface px-3 text-xs font-semibold text-secondary transition-colors hover:border-border-strong hover:text-ink"
          >
            Manage my list
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Nothing here yet" />
        </div>
      ) : (
        <>
          <div className="mt-6 border-b border-border pb-2.5">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search this list..."
              className="w-full"
            />

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <FilterGroup
                label="Status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
                variant="segmented"
                getLabel={(option) => STATUS_LABELS[option]}
                className="w-full sm:w-[280px]"
              />

              <ViewToggle view={view} onChange={setView} />
            </div>
          </div>

          <div className="mt-4">
            {visible.length === 0 ? (
              <EmptyState title="No experiences found" />
            ) : (
              <ExperienceResults
                experiences={visible.map((entry) => entry.experience)}
                view={view}
                completed={completedIds}
                onToggle={noop}
                guest
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
