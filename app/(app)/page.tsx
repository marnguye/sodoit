import { createClient } from "@/lib/supabase/server";
import { BrowseBoard } from "./browse/BrowseBoard";
import {
  loadExperiencesPage,
  loadAllExperiences,
  loadCompletedIds,
  loadGrandTotal,
  loadCuratedSections,
} from "./browse/data";
import type { StatusFilter } from "./browse/types";

const STATUS_VALUES: StatusFilter[] = ["all", "completed", "uncompleted"];

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const q = (params.q ?? "").trim();
  const category =
    params.category && params.category !== "All" ? params.category : null;

  const completedIds = user ? await loadCompletedIds(user.id) : [];

  if (user) {
    const status: StatusFilter = STATUS_VALUES.includes(
      params.status as StatusFilter,
    )
      ? (params.status as StatusFilter)
      : "all";

    const [experiences, grandTotal] = await Promise.all([
      loadAllExperiences({ q, category, status }, completedIds),
      loadGrandTotal(),
    ]);

    return (
      <BrowseBoard
        experiences={experiences}
        completedIds={completedIds}
        signedIn
        grandTotal={grandTotal}
        filteredCount={experiences.length}
        page={1}
        q={q}
        category={category}
        status={status}
        curatedSections={[]}
      />
    );
  }

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const isDefaultView = !q && !category && page === 1;

  const [{ experiences, filteredCount }, grandTotal, curatedSections] =
    await Promise.all([
      loadExperiencesPage({ q, category, status: "all", page }, completedIds),
      loadGrandTotal(),
      isDefaultView ? loadCuratedSections() : Promise.resolve([]),
    ]);

  return (
    <BrowseBoard
      experiences={experiences}
      completedIds={completedIds}
      signedIn={false}
      grandTotal={grandTotal}
      filteredCount={filteredCount}
      page={page}
      q={q}
      category={category}
      status="all"
      curatedSections={curatedSections}
    />
  );
}
