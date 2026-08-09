import { createClient } from "@/lib/supabase/server";
import { BrowseBoard } from "./browse/BrowseBoard";
import {
  loadExperiencesPage,
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
  const status: StatusFilter = STATUS_VALUES.includes(
    params.status as StatusFilter,
  )
    ? (params.status as StatusFilter)
    : "all";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const completedIds = user ? await loadCompletedIds(user.id) : [];
  const effectiveStatus = user ? status : "all";

  const isDefaultView = !user && !q && !category && page === 1;

  const [{ experiences, filteredCount }, grandTotal, curatedSections] =
    await Promise.all([
      loadExperiencesPage(
        { q, category, status: effectiveStatus, page },
        completedIds,
      ),
      loadGrandTotal(),
      isDefaultView ? loadCuratedSections() : Promise.resolve([]),
    ]);

  return (
    <BrowseBoard
      experiences={experiences}
      completedIds={completedIds}
      signedIn={Boolean(user)}
      grandTotal={grandTotal}
      filteredCount={filteredCount}
      page={page}
      q={q}
      category={category}
      status={effectiveStatus}
      curatedSections={curatedSections}
    />
  );
}
