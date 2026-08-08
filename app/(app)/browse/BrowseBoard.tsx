"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, CheckCircle2, Search, Share2 } from "lucide-react";

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

  const content = (
    <>
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

      {filtered.length === 0 ? (
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
      )}
    </>
  );

  if (signedIn) {
    return <div className="mx-auto w-full max-w-[1200px]">{content}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] py-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <section className="mb-8 pt-4">
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              Discover something
              <br />
              worth doing.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Find experiences, challenges and ideas worth trying. Save them, do
              them, and make your list your own.
            </p>
          </section>

          {content}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-5">
            <section className="rounded-2xl border border-border bg-white p-5">
              <h2 className="text-base font-bold text-ink">How it works</h2>

              <div className="mt-5 flex flex-col gap-5">
                <HowItWorksItem
                  icon={Search}
                  title="Discover"
                  description="Find experiences and ideas worth trying."
                />

                <HowItWorksItem
                  icon={Bookmark}
                  title="Save"
                  description="Build your personal list of things to do."
                />

                <HowItWorksItem
                  icon={CheckCircle2}
                  title="Do"
                  description="Complete experiences in the real world."
                />

                <HowItWorksItem
                  icon={Share2}
                  title="Share"
                  description="Share what you learned with the community."
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-accent/[0.04] p-5">
              <p className="text-lg font-bold leading-6 text-ink">
                Your life.
                <br />
                Your list.
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                Create your own list and start keeping track of the things you
                actually want to do.
              </p>

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="mt-5 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                Create your list
              </button>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HowItWorksItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Search;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent-dark">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>

        <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
      </div>
    </div>
  );
}
