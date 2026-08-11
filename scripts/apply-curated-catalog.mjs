import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  buildCuratedCatalogAudit,
  planCuratedCatalog,
  validateCuratedCatalog,
} from "./content/lib/curation.mjs";

const CONFIG_PATH = new URL("./content/curated-catalog.json", import.meta.url);
const REPORT_PATH = new URL(
  "./content/reports/curated-catalog-audit.json",
  import.meta.url,
);
const PAGE_SIZE = 1000;

async function loadAll(supabase, table, columns) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

function hiddenReferences(rows, listRows, curatedSlugs) {
  const hiddenIds = new Set(
    rows.filter(({ slug }) => !curatedSlugs.has(slug)).map(({ id }) => id),
  );
  const summarize = (status) => {
    const references = listRows.filter(
      (row) => row.status === status && hiddenIds.has(row.experience_id),
    );
    return {
      experiences: new Set(references.map(({ experience_id }) => experience_id))
        .size,
      users: new Set(references.map(({ user_id }) => user_id)).size,
      list_rows: references.length,
    };
  };
  return { saved: summarize("saved"), completed: summarize("completed") };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const rlsConfirmed = process.argv.includes("--confirm-life-list-rls");
  const unknownArgs = process.argv
    .slice(2)
    .filter((arg) => arg !== "--dry-run" && arg !== "--confirm-life-list-rls");
  if (unknownArgs.length)
    throw new Error(`Unknown argument: ${unknownArgs[0]}`);

  const rawConfig = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  const { config, errors } = validateCuratedCatalog(rawConfig);
  if (errors.length) {
    console.log(`Invalid config entries: ${errors.length}`);
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

  const [rows, listRows] = await Promise.all([
    loadAll(
      supabase,
      "experiences",
      "id, slug, title, description, category, difficulty, image_url, image_alt, is_public, featured, saved_count, completed_count, location_type, country_code, city, created_at",
    ),
    loadAll(supabase, "user_lists", "id, user_id, experience_id, status"),
  ]);
  const plan = planCuratedCatalog(rows, config);
  const references = hiddenReferences(
    rows,
    listRows,
    new Set(config.experiences.map(({ slug }) => slug)),
  );

  console.log(`Total Experiences: ${rows.length}`);
  console.log(`Currently public: ${plan.currentPublic}`);
  console.log(`Curated public target: ${plan.finalPublic}`);
  console.log(`To hide: ${plan.toHide}`);
  console.log(`To publish: ${plan.toPublish}`);
  console.log(`Currently featured: ${plan.currentFeatured}`);
  console.log(`Final featured: ${plan.finalFeatured}`);
  console.log(
    `Exact duplicate groups: ${config.exact_duplicate_decisions.length}`,
  );
  console.log(
    `Near-duplicate decisions: ${config.near_duplicate_decisions.length}`,
  );
  console.log(`Hidden with saved users: ${references.saved.experiences}`);
  console.log(
    `Hidden with completed users: ${references.completed.experiences}`,
  );
  console.log(`Missing curated slugs: ${plan.missingSlugs.length}`);
  console.log("Invalid config entries: 0");

  mkdirSync(new URL(".", REPORT_PATH), { recursive: true });
  writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(buildCuratedCatalogAudit(rows, config, plan, references), null, 2)}\n`,
  );

  if (plan.missingSlugs.length) {
    throw new Error(
      `Unknown configured slugs: ${plan.missingSlugs.join(", ")}`,
    );
  }
  if (dryRun) {
    console.log("Dry run: no writes performed.");
    return;
  }
  if (
    !rlsConfirmed &&
    references.saved.list_rows + references.completed.list_rows > 0
  ) {
    throw new Error(
      "Apply sql_schema_0.2.0_curated_catalog_rls.sql, then rerun with --confirm-life-list-rls",
    );
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
    if ((index + 1) % 50 === 0 || index + 1 === plan.updates.length) {
      console.log(`Updated: ${index + 1}/${plan.updates.length}`);
    }
  }
}

await main();
