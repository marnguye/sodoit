"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BrowseToolbar } from "./components/BrowseToolbar";
import { BrowseHero } from "./components/BrowseHero";
import { BrowseSidebar } from "./components/BrowseSidebar";
import { ExperienceSection } from "./components/ExperienceSection";
import { TaskRow } from "./components/TaskRow";
import { setListStatus, removeFromMyList } from "./actions";
import type { Experience, StatusFilter } from "./types";

const CURATED_SECTIONS: { title: string; categories: string[] }[] = [
  { title: "Adventure picks", categories: ["Adventure"] },
  { title: "Food & skills", categories: ["Food", "Skills"] },
  { title: "Travel ideas", categories: ["Travel"] },
];

const CURATED_SECTION_LIMIT = 6;

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

      if (signedIn) {
        const isDone = completed.has(experience.id);

        if (status === "completed" && !isDone) {
          return false;
        }

        if (status === "uncompleted" && isDone) {
          return false;
        }
      }

      return true;
    });
  }, [experiences, search, category, status, completed, signedIn]);

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

  function requireLogin() {
    router.push("/login");
  }

  const isDefaultView = !signedIn && !search.trim() && category === "All";

  const curatedSections = useMemo(() => {
    if (!isDefaultView) {
      return [];
    }

    return CURATED_SECTIONS.map(({ title, categories: sectionCategories }) => ({
      title,
      items: experiences
        .filter(
          (experience) =>
            experience.category &&
            sectionCategories.includes(experience.category),
        )
        .slice(0, CURATED_SECTION_LIMIT),
    })).filter((section) => section.items.length > 0);
  }, [experiences, isDefaultView]);

  const toolbar = (
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
      signedIn={signedIn}
    />
  );

  const flatList =
    filtered.length === 0 ? (
      <p className="py-16 text-center text-sm text-muted">
        Nothing matches. Try a different search or category.
      </p>
    ) : (
      <ul className="divide-y divide-border">
        {filtered.map((experience) => (
          <TaskRow
            key={experience.id}
            experience={experience}
            done={completed.has(experience.id)}
            onToggle={() => toggle(experience.id)}
            guest={!signedIn}
            onGuestSave={requireLogin}
          />
        ))}
      </ul>
    );

  if (signedIn) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        {toolbar}
        {flatList}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] py-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <BrowseHero />
          {toolbar}

          {curatedSections.map((section) => (
            <ExperienceSection
              key={section.title}
              title={section.title}
              experiences={section.items}
              completed={completed}
              onToggle={toggle}
              guest
              onGuestSave={requireLogin}
              layout="grid"
            />
          ))}

          <section className="mt-2">
            {curatedSections.length > 0 && (
              <h2 className="mb-3 text-sm font-bold text-ink">
                Explore experiences
              </h2>
            )}

            {flatList}
          </section>
        </div>

        <aside>
          <BrowseSidebar />
        </aside>
      </div>
    </div>
  );
}
