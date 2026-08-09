import { createClient } from "@supabase/supabase-js";
import { readCsv } from "./lib/csv.mjs";
import { validateRow } from "./lib/validation.mjs";
import { loadExistingTitleKeys } from "./lib/existing-titles.mjs";

const DEFAULT_CSV_PATH = new URL(
  "./data/experiences-example.csv",
  import.meta.url,
).pathname;

export function validateRows(rawRows) {
  const invalid = [];
  const candidates = [];

  rawRows.forEach((raw, index) => {
    const rowNumber = index + 2;

    const result = validateRow(raw, rowNumber);

    if (!result.valid) {
      invalid.push(...result.errors);
      return;
    }

    candidates.push({ rowNumber, ...result.row });
  });

  return { invalid, candidates };
}

export function partitionDuplicates(candidates, existingKeys = new Set()) {
  const seen = new Set(existingKeys);
  const toInsert = [];
  const duplicates = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.slug)) {
      duplicates.push(candidate);
      continue;
    }

    seen.add(candidate.slug);
    toInsert.push(candidate);
  }

  return { toInsert, duplicates };
}

async function main() {
  const path = process.argv[2] ?? DEFAULT_CSV_PATH;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Validating: ${path}\n`);

  const rawRows = readCsv(path);
  const { invalid, candidates } = validateRows(rawRows);
  const existingKeys = await loadExistingTitleKeys(supabase);
  const { toInsert, duplicates } = partitionDuplicates(
    candidates,
    existingKeys,
  );

  console.log(`${rawRows.length} loaded`);
  console.log(`${candidates.length} valid`);
  console.log(`${invalid.length} invalid`);
  console.log(`${duplicates.length} duplicates found`);
  console.log(`${toInsert.length} ready to import`);

  if (invalid.length > 0) {
    console.log("\nValidation errors:");
    invalid.forEach((line) => console.log(`  ${line}`));
  }

  if (duplicates.length > 0) {
    console.log("\nDuplicates:");
    duplicates.forEach((row) =>
      console.log(`  Row ${row.rowNumber}: duplicate — \`${row.title}\``),
    );
  }

  console.log("\nDry run only. Nothing written to Supabase.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
