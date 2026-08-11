import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  buildExperienceAudit,
  planExperienceClassification,
  validateClassificationConfig,
} from "./content/lib/classification.mjs";

const CONFIG_PATH = new URL(
  "./content/experience-classification.json",
  import.meta.url,
);
const REPORT_PATH = new URL(
  "./content/reports/experience-classification-report.json",
  import.meta.url,
);
const PAGE_SIZE = 1000;

async function loadExperiences(supabase) {
  const rows = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("experiences")
      .select(
        "id, slug, title, category, description, image_url, location_type, country_code, city, featured",
      )
      .order("slug")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const unknownArgs = process.argv
    .slice(2)
    .filter((arg) => arg !== "--dry-run");
  if (unknownArgs.length)
    throw new Error(`Unknown argument: ${unknownArgs[0]}`);

  const parsed = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  const { config, errors } = validateClassificationConfig(parsed);
  if (errors.length) {
    console.log(`Invalid mappings: ${errors.length}`);
    throw new Error(errors.join("\n"));
  }

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
  const plan = planExperienceClassification(rows, config);

  console.log(`Total experiences: ${rows.length}`);
  console.log(`Explicit classifications: ${plan.explicitClassifications}`);
  console.log(`Global: ${plan.locations.global}`);
  console.log(`Country: ${plan.locations.country}`);
  console.log(`City: ${plan.locations.city}`);
  console.log(`Featured: ${plan.featured}`);
  console.log(`Unchanged: ${plan.unchanged}`);
  console.log("Invalid mappings: 0");
  console.log(
    `Missing slugs referenced by config: ${plan.missingSlugs.length}`,
  );

  mkdirSync(new URL(".", REPORT_PATH), { recursive: true });
  writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(buildExperienceAudit(rows), null, 2)}\n`,
  );

  if (plan.missingSlugs.length) {
    throw new Error(`Unknown slugs: ${plan.missingSlugs.join(", ")}`);
  }
  if (dryRun) {
    console.log("Dry run: no writes performed.");
    return;
  }

  for (const [index, update] of plan.updates.entries()) {
    const { data, error } = await supabase
      .from("experiences")
      .update(update.values)
      .eq("id", update.id)
      .eq("slug", update.slug)
      .select("id");
    if (error) throw new Error(`Update ${index + 1} failed: ${error.message}`);
    if (data?.length !== 1) {
      throw new Error(`Update ${index + 1} skipped because the row changed`);
    }
  }

  console.log(`Updated: ${plan.updates.length}`);
}

await main();
