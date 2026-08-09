import { createClient } from "@supabase/supabase-js";
import { readCsv } from "./lib/csv.mjs";
import { loadExistingTitleKeys } from "./lib/existing-titles.mjs";
import { validateRows, partitionDuplicates } from "./validate-experiences.mjs";

const DEFAULT_CSV_PATH = new URL(
  "./data/experiences-example.csv",
  import.meta.url,
).pathname;

const BATCH_SIZE = 200;

function chunk(items, size) {
  const chunks = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

async function insertBatches(supabase, rows) {
  let inserted = 0;
  let failed = 0;

  for (const batch of chunk(rows, BATCH_SIZE)) {
    const { error } = await supabase.from("experiences").insert(
      batch.map((row) => ({
        title: row.title,
        description: row.description,
        category: row.category,
        difficulty: row.difficulty,
        image_query: row.imageQuery,
        is_public: true,
        image_url: null,
        image_alt: null,
      })),
    );

    if (error) {
      console.error(`  Batch of ${batch.length} failed: ${error.message}`);
      failed += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  return { inserted, failed };
}

async function main() {
  const path = process.argv[2] ?? DEFAULT_CSV_PATH;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Importing: ${path}\n`);

  const rawRows = readCsv(path);
  const { invalid, candidates } = validateRows(rawRows);

  if (invalid.length > 0) {
    console.log("Validation errors (these rows are skipped):");
    invalid.forEach((line) => console.log(`  ${line}`));
    console.log("");
  }

  const existingKeys = await loadExistingTitleKeys(supabase);
  const { toInsert, duplicates } = partitionDuplicates(
    candidates,
    existingKeys,
  );

  const { inserted, failed } = await insertBatches(supabase, toInsert);

  console.log(`${rawRows.length} loaded`);
  console.log(`${candidates.length} valid`);
  console.log(`${invalid.length} invalid`);
  console.log(`${inserted} inserted`);
  console.log(`${duplicates.length} duplicates skipped`);
  console.log(`${failed} failed`);
}

await main();
