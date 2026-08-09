import { slugify } from "./normalize.mjs";

const PAGE_SIZE = 1000;

export async function loadExistingTitleKeys(supabase) {
  const keys = new Set();
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("experiences")
      .select("title")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    for (const row of data ?? []) {
      keys.add(slugify(row.title));
    }

    if (!data || data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return keys;
}
