"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { BrowseToolbar } from "./components/BrowseToolbar";
import { BrowseHero } from "./components/BrowseHero";
import { BrowseSidebar } from "./components/BrowseSidebar";
import { ExperienceSection } from "./components/ExperienceSection";
import { Pagination } from "./components/Pagination";
import { TaskRow } from "./components/TaskRow";
import { setListStatus, removeFromMyList } from "./actions";
import { loginHrefWithNext } from "@/lib/auth-redirect";
import { CATEGORIES, PAGE_SIZE } from "./types";
import type { Experience, StatusFilter } from "./types";
import type { CuratedSection } from "./data";

const SEARCH_DEBOUNCE_MS = 300;
const ALL_CATEGORIES = ["All", ...CATEGORIES] as const;

function buildHref({
  q,
  category,
  status,
  page,
}: {
  q: string;
  category: string | null;
  status: StatusFilter;
  page: number;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));

  const qs = params.toString();

  return qs ? `/?${qs}` : "/";
}

interface BrowseBoardProps {
  experiences: Experience[];
  completedIds: string[];
  signedIn: boolean;
  grandTotal: number;
  filteredCount: number;
  page: number;
  q: string;
  category: string | null;
  status: StatusFilter;
  curatedSections: CuratedSection[];
}

export function BrowseBoard({
  experiences,
  completedIds,
  signedIn,
  grandTotal,
  filteredCount,
  page,
  q,
  category,
  status,
  curatedSections,
}: BrowseBoardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [completed, setCompleted] = useState(() => new Set(completedIds));
  const [searchText, setSearchText] = useState(q);
  const isFirstRender = useRef(true);

  // Re-sync local state when the server hands us fresh props after a
  // navigation (new page/filter/search), without an effect+setState pass.
  const [prevCompletedIds, setPrevCompletedIds] = useState(completedIds);
  if (completedIds !== prevCompletedIds) {
    setPrevCompletedIds(completedIds);
    setCompleted(new Set(completedIds));
  }

  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearchText(q);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      router.push(buildHref({ q: searchText, category, status, page: 1 }));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  async function toggle(id: string): Promise<void> {
    if (!signedIn) {
      router.push(loginHrefWithNext(pathname));
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
    router.push(loginHrefWithNext(pathname));
  }

  const pageCount = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));

  const toolbar = (
    <BrowseToolbar
      search={searchText}
      onSearchChange={setSearchText}
      categories={ALL_CATEGORIES}
      category={category ?? "All"}
      onCategoryChange={(next) =>
        router.push(
          buildHref({
            q: searchText,
            category: next === "All" ? null : next,
            status,
            page: 1,
          }),
        )
      }
      status={status}
      onStatusChange={(next) =>
        router.push(
          buildHref({ q: searchText, category, status: next, page: 1 }),
        )
      }
      completedCount={completedIds.length}
      totalCount={grandTotal}
      signedIn={signedIn}
    />
  );

  const list =
    experiences.length === 0 ? (
      <p className="py-16 text-center text-sm text-muted">
        Nothing matches. Try a different search or category.
      </p>
    ) : (
      <ul className="divide-y divide-border">
        {experiences.map((experience) => (
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

  const pagination = signedIn ? null : (
    <Pagination
      page={page}
      pageCount={pageCount}
      buildHref={(p) => buildHref({ q: searchText, category, status, page: p })}
    />
  );

  if (signedIn) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {toolbar}
        {list}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8">
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

            {list}
            {pagination}
          </section>
        </div>

        <aside>
          <BrowseSidebar />
        </aside>
      </div>
    </div>
  );
}
