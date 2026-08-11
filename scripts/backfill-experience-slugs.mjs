import { createClient } from "@supabase/supabase-js";
import { planExperienceSlugBackfill } from "../lib/experiences/slug.mjs";

const PAGE_SIZE = 1000;
const dryRun = process.argv.includes("--dry-run");

async function loadExperiences(supabase) {
  const rows = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("experiences")
      .select("id, title, slug")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

async function main() {
  const unknownArgs = process.argv
    .slice(2)
    .filter((arg) => arg !== "--dry-run");
  if (unknownArgs.length)
    throw new Error(`Unknown argument: ${unknownArgs[0]}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const rows = await loadExperiences(supabase);
  const alreadySlugged = rows.filter(({ slug }) => slug).length;
  const { updates, collisions } = planExperienceSlugBackfill(rows);

  console.log(`Total rows: ${rows.length}`);
  console.log(`Already slugged: ${alreadySlugged}`);
  console.log(`Missing slugs: ${rows.length - alreadySlugged}`);
  console.log(`Proposed updates: ${updates.length}`);
  console.log(`Collisions: ${collisions}`);

  if (dryRun) {
    console.log("Dry run: no writes performed.");
    return;
  }

  for (let index = 0; index < updates.length; index += 1) {
    const { id, slug } = updates[index];
    const { data, error } = await supabase
      .from("experiences")
      .update({ slug })
      .eq("id", id)
      .is("slug", null)
      .select("id");

    if (error) throw new Error(`Update ${index + 1} failed: ${error.message}`);
    if (data?.length !== 1) {
      throw new Error(`Update ${index + 1} skipped because the row changed`);
    }

    if ((index + 1) % 50 === 0 || index + 1 === updates.length) {
      console.log(`Updated: ${index + 1}/${updates.length}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
