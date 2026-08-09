import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "./types";
import type { Experience, StatusFilter } from "./types";

const EXPERIENCE_COLUMNS =
  "id, title, category, description, difficulty, image_url, image_alt";

// experience_id never legitimately equals this — used to force an empty
// result set without a special-cased empty-array query branch.
const NONE_ID = "00000000-0000-0000-0000-000000000000";

export async function loadCompletedIds(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_lists")
    .select("experience_id")
    .eq("user_id", userId)
    .eq("status", "completed");

  return (data ?? []).map((row) => row.experience_id);
}

export async function loadGrandTotal(): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("experiences")
    .select("id", { count: "exact", head: true });

  return count ?? 0;
}

interface BrowseQuery {
  q: string;
  category: string | null;
  status: StatusFilter;
  page: number;
}

interface BrowseResult {
  experiences: Experience[];
  filteredCount: number;
}

export async function loadExperiencesPage(
  { q, category, status, page }: BrowseQuery,
  completedIds: string[],
): Promise<BrowseResult> {
  const supabase = await createClient();

  let query = supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (status === "completed") {
    query = query.in("id", completedIds.length > 0 ? completedIds : [NONE_ID]);
  } else if (status === "uncompleted" && completedIds.length > 0) {
    query = query.not("id", "in", `(${completedIds.join(",")})`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await query.range(from, to);

  return {
    experiences: (data ?? []) as Experience[],
    filteredCount: count ?? 0,
  };
}

const CURATED_SECTIONS_DEF: { title: string; categories: string[] }[] = [
  { title: "Adventure picks", categories: ["Adventure"] },
  { title: "Food & skills", categories: ["Food", "Skills"] },
  { title: "Travel ideas", categories: ["Travel"] },
];

const CURATED_SECTION_LIMIT = 6;

export interface CuratedSection {
  title: string;
  items: Experience[];
}

export async function loadCuratedSections(): Promise<CuratedSection[]> {
  const supabase = await createClient();

  const results = await Promise.all(
    CURATED_SECTIONS_DEF.map(async ({ title, categories }) => {
      const { data } = await supabase
        .from("experiences")
        .select(EXPERIENCE_COLUMNS)
        .in("category", categories)
        .order("created_at", { ascending: false })
        .limit(CURATED_SECTION_LIMIT);

      return { title, items: (data ?? []) as Experience[] };
    }),
  );

  return results.filter((section) => section.items.length > 0);
}
