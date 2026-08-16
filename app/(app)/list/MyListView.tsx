"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHero, ViewToggle, EmptyState, Button } from "@/components/ui";
import { SearchField } from "@/components/ui/SearchField";
import { FilterGroup } from "@/app/(app)/browse/components/FilterGroup";
import { ExperienceResults } from "@/app/(app)/browse/components/ExperienceResults";
import { setListStatus, removeFromMyList } from "@/app/(app)/browse/actions";
import type {
  BrowseView,
  Experience,
  ListStatus,
} from "@/app/(app)/browse/types";
import { ListVisibilityControl } from "./ListVisibilityControl";
import { CollectionsSection } from "./collections/CollectionsSection";
import { AddToCollectionMenu } from "./collections/AddToCollectionMenu";
import type { Collection, Visibility } from "./collections/types";

type MyListStatus = "all" | ListStatus;

const STATUS_OPTIONS: readonly MyListStatus[] = ["all", "saved", "completed"];
const STATUS_LABELS: Record<MyListStatus, string> = {
  all: "All",
  saved: "Saved",
  completed: "Completed",
};

const EMPTY_STATUS_TITLES: Record<MyListStatus, string> = {
  all: "No experiences found",
  saved: "No saved experiences",
  completed: "Nothing completed yet",
};

interface Entry {
  experience: Experience;
  status: ListStatus;
}

interface MyListViewProps {
  username: string;
  saved: Experience[];
  completed: Experience[];
  view: BrowseView;
  visibility: Visibility;
  collections: Collection[];
  membership: Record<string, string[]>;
}

export function MyListView({
  username,
  saved,
  completed,
  view,
  visibility,
  collections: initialCollections,
  membership: initialMembership,
}: MyListViewProps) {
  const router = useRouter();

  const [entries, setEntries] = useState<Entry[]>(() => [
    ...saved.map((experience) => ({ experience, status: "saved" as const })),
    ...completed.map((experience) => ({
      experience,
      status: "completed" as const,
    })),
  ]);

  const [status, setStatus] = useState<MyListStatus>("all");
  const [search, setSearch] = useState("");
  const [collections, setCollections] = useState(initialCollections);
  const [membership, setMembership] = useState(
    () =>
      new Map(
        Object.entries(initialMembership).map(([id, ids]) => [
          id,
          new Set(ids),
        ]),
      ),
  );
  const [managingId, setManagingId] = useState<string | null>(null);

  const isEmpty = entries.length === 0;

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

  const completedIds = new Set(
    entries
      .filter((entry) => entry.status === "completed")
      .map((entry) => entry.experience.id),
  );

  async function toggle(id: string): Promise<void> {
    const entry = entries.find((row) => row.experience.id === id);
    if (!entry) return;

    const nextStatus: ListStatus =
      entry.status === "completed" ? "saved" : "completed";

    setEntries((previous) =>
      previous.map((row) =>
        row.experience.id === id ? { ...row, status: nextStatus } : row,
      ),
    );

    try {
      await setListStatus(id, nextStatus);
    } catch (error) {
      setEntries((previous) =>
        previous.map((row) =>
          row.experience.id === id ? { ...row, status: entry.status } : row,
        ),
      );
      throw error;
    }
  }

  async function remove(id: string): Promise<void> {
    const removedEntry = entries.find((row) => row.experience.id === id);

    setEntries((previous) =>
      previous.filter((row) => row.experience.id !== id),
    );

    try {
      await removeFromMyList(id);
    } catch (error) {
      if (removedEntry) {
        setEntries((previous) => [...previous, removedEntry]);
      }
      throw error;
    }
  }

  function changeView(nextView: BrowseView) {
    router.push(nextView === "grid" ? "/list" : `/list?view=${nextView}`);
  }

  function toggleMembership(collectionId: string, member: boolean) {
    setMembership((previous) => {
      const next = new Map(previous);
      const current = new Set(next.get(managingId ?? "") ?? []);

      if (member) current.add(collectionId);
      else current.delete(collectionId);

      if (managingId) next.set(managingId, current);
      return next;
    });

    setCollections((previous) =>
      previous.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              itemCount: collection.itemCount + (member ? 1 : -1),
            }
          : collection,
      ),
    );
  }

  const managingExperience = entries.find(
    (entry) => entry.experience.id === managingId,
  )?.experience;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHero
          title="My list"
          subtitle="Everything you've saved and completed."
        />

        <div className="pt-1">
          <ListVisibilityControl username={username} visibility={visibility} />
        </div>
      </div>

      <CollectionsSection
        username={username}
        collections={collections}
        onCollectionsChange={setCollections}
      />

      {isEmpty ? (
        <div className="mt-8">
          <EmptyState
            title="Your list is empty"
            description="Save experiences from Browse and they'll show up here."
            action={
              <Button type="button" onClick={() => router.push("/")}>
                Browse experiences
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="sticky top-16 z-30 mt-8 border-b border-border bg-background py-2.5">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search your list..."
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

              <ViewToggle view={view} onChange={changeView} />
            </div>
          </div>

          <div className="mt-4">
            {visible.length === 0 ? (
              <EmptyState
                title={
                  search.trim()
                    ? "No experiences found"
                    : EMPTY_STATUS_TITLES[status]
                }
                description={
                  search.trim() ? "Try a different search." : undefined
                }
              />
            ) : (
              <ExperienceResults
                experiences={visible.map((entry) => entry.experience)}
                view={view}
                completed={completedIds}
                onToggle={toggle}
                onRemove={remove}
                onManageCollections={setManagingId}
              />
            )}
          </div>
        </>
      )}

      {managingId && managingExperience && (
        <AddToCollectionMenu
          experienceId={managingId}
          experienceTitle={managingExperience.title}
          collections={collections}
          memberOf={membership.get(managingId) ?? new Set()}
          onClose={() => setManagingId(null)}
          onToggled={toggleMembership}
          onCreated={(collection) =>
            setCollections((previous) => [collection, ...previous])
          }
        />
      )}
    </div>
  );
}
