"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { BrowseToolbar } from "./components/BrowseToolbar";
import { BrowseHero } from "./components/BrowseHero";
import { BrowseSignupCta } from "./components/BrowseSignupCta";
import { ExperienceSection } from "./components/ExperienceSection";
import type { SectionVariant } from "./components/ExperienceSection";
import { ExperienceFeature } from "./components/ExperienceFeature";
import { InfiniteExperienceResults } from "./components/InfiniteExperienceResults";
import { setListStatus, removeFromMyList } from "./actions";
import { loginHrefWithNext } from "@/lib/auth-redirect";
import { CATEGORIES } from "./types";
import { isDefaultBrowseView, splitFeatured } from "./browse-editorial";
import type { BrowseSort, BrowseView, Experience, StatusFilter } from "./types";
import type { CuratedSection } from "./data";

const SEARCH_DEBOUNCE_MS = 300;
const ALL_CATEGORIES = ["All", ...CATEGORIES] as const;

function buildHref({
  q,
  category,
  difficulty,
  status,
  sort,
  view,
}: {
  q: string;
  category: string | null;
  difficulty: string | null;
  status: StatusFilter;
  sort: BrowseSort;
  view: BrowseView;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);
  if (status !== "all") params.set("status", status);
  if (sort !== "recommended") params.set("sort", sort);
  if (view !== "grid") params.set("view", view);

  const qs = params.toString();

  return qs ? `/?${qs}` : "/";
}

interface BrowseBoardProps {
  experiences: Experience[];
  nextCursor: string | null;
  hasMore: boolean;
  completedIds: string[];
  signedIn: boolean;
  q: string;
  category: string | null;
  difficulty: string | null;
  status: StatusFilter;
  sort: BrowseSort;
  view: BrowseView;
  curatedSections: CuratedSection[];
  resultCount: number | null;
}

export function BrowseBoard({
  experiences,
  nextCursor,
  hasMore,
  completedIds,
  signedIn,
  q,
  category,
  difficulty,
  status,
  sort,
  view,
  curatedSections,
  resultCount,
}: BrowseBoardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [completed, setCompleted] = useState(() => new Set(completedIds));
  const [searchText, setSearchText] = useState(q);
  const isFirstRender = useRef(true);

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
      router.push(
        buildHref({ q: searchText, category, difficulty, status, sort, view }),
      );
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

  const isDefaultView = isDefaultBrowseView({
    q,
    category,
    difficulty,
    status,
    sort,
  });

  const { featured, rest } = splitFeatured(experiences, isDefaultView);
  const remainingExperiences = isDefaultView ? rest : experiences;

  function sectionVariant(index: number): SectionVariant {
    return index === 0 ? "wide" : "standard";
  }

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
            difficulty,
            status,
            sort,
            view,
          }),
        )
      }
      status={status}
      onStatusChange={(next) =>
        router.push(
          buildHref({
            q: searchText,
            category,
            difficulty,
            status: next,
            sort,
            view,
          }),
        )
      }
      completedCount={completedIds.length}
      signedIn={signedIn}
      view={view}
      onViewChange={(next) =>
        router.push(
          buildHref({
            q: searchText,
            category,
            difficulty,
            status,
            sort,
            view: next,
          }),
        )
      }
      sort={sort}
      onSortChange={(next) =>
        router.push(
          buildHref({
            q: searchText,
            category,
            difficulty,
            status,
            sort: next,
            view,
          }),
        )
      }
      difficulty={difficulty}
      onDifficultyChange={(next) =>
        router.push(
          buildHref({
            q: searchText,
            category,
            difficulty: next,
            status,
            sort,
            view,
          }),
        )
      }
    />
  );

  const results = (
    <InfiniteExperienceResults
      initialExperiences={remainingExperiences}
      initialCursor={nextCursor}
      initialHasMore={hasMore}
      view={view}
      completed={completed}
      onToggle={toggle}
      guest={!signedIn}
      onGuestSave={requireLogin}
      q={q}
      category={category}
      difficulty={difficulty}
      status={status}
      sort={sort}
      resetKey={[q, category, difficulty, status, sort].join("|")}
      inlineContent={signedIn ? undefined : <BrowseSignupCta compact />}
    />
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
      <BrowseHero />
      {toolbar}

      <div className="mt-6">
        {isDefaultView ? (
          <>
            {featured && (
              <ExperienceFeature
                experience={featured}
                done={completed.has(featured.id)}
                onToggle={() => toggle(featured.id)}
                guest={!signedIn}
                onGuestSave={requireLogin}
              />
            )}

            {!signedIn &&
              curatedSections.map((section, index) => (
                <ExperienceSection
                  key={section.title}
                  title={section.title}
                  experiences={section.items}
                  completed={completed}
                  onToggle={toggle}
                  guest
                  onGuestSave={requireLogin}
                  variant={sectionVariant(index)}
                />
              ))}

            <section className="mt-10">
              <h2 className="mb-4 text-base font-bold tracking-[-0.01em] text-ink">
                Explore experiences
              </h2>

              {results}
            </section>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p
                className="text-sm text-secondary"
                role="status"
                aria-live="polite"
              >
                {resultCount === null
                  ? null
                  : `${resultCount} ${resultCount === 1 ? "result" : "results"}`}
              </p>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-xs font-semibold text-accent-dark hover:text-accent"
              >
                Clear filters
              </button>
            </div>

            {results}
          </>
        )}
      </div>
    </div>
  );
}
