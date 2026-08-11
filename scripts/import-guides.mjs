import { readdirSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  planGuideImport,
  validateGuideSources,
} from "./content/lib/guides.mjs";

const GUIDE_DIRECTORY = new URL("./content/guides/", import.meta.url);
const GUIDE_COLUMNS =
  "id, slug, title, description, city, country_code, cover_image_url, cover_image_alt, duration_label, is_public, featured, created_at, updated_at";
const ITEM_COLUMNS =
  "id, guide_id, position, title, description, place_name, image_url, image_alt, external_url, created_at, updated_at";

function loadSources() {
  return readdirSync(GUIDE_DIRECTORY)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      try {
        return {
          file,
          value: JSON.parse(
            readFileSync(new URL(file, GUIDE_DIRECTORY), "utf8"),
          ),
        };
      } catch (error) {
        throw new Error(`${file}: invalid JSON: ${error.message}`);
      }
    });
}

async function loadDatabase(supabase) {
  const [guides, items] = await Promise.all([
    supabase.from("guides").select(GUIDE_COLUMNS).order("slug"),
    supabase
      .from("guide_items")
      .select(ITEM_COLUMNS)
      .order("guide_id")
      .order("position"),
  ]);
  if (guides.error) throw new Error(`Load Guides: ${guides.error.message}`);
  if (items.error) throw new Error(`Load Guide Items: ${items.error.message}`);
  return { guides: guides.data ?? [], items: items.data ?? [] };
}

function itemRows(guideId, items) {
  return items.map((item) => ({ guide_id: guideId, ...item }));
}

async function createGuide(supabase, action) {
  const result = await supabase
    .from("guides")
    .insert(action.guide)
    .select("id")
    .single();
  if (result.error) {
    throw new Error(`${action.slug}: create failed: ${result.error.message}`);
  }

  const inserted = await supabase
    .from("guide_items")
    .insert(itemRows(result.data.id, action.items));
  if (!inserted.error) return;

  const cleanup = await supabase
    .from("guides")
    .delete()
    .eq("id", result.data.id);
  const suffix = cleanup.error
    ? `; cleanup also failed: ${cleanup.error.message}`
    : "";
  throw new Error(
    `${action.slug}: item insert failed: ${inserted.error.message}${suffix}`,
  );
}

async function replaceItems(supabase, action) {
  // ponytail: REST calls are not atomic; use a transactional RPC before concurrent editorial imports.
  const removed = await supabase
    .from("guide_items")
    .delete()
    .eq("guide_id", action.id);
  if (removed.error) {
    throw new Error(
      `${action.slug}: item delete failed: ${removed.error.message}`,
    );
  }

  const inserted = await supabase
    .from("guide_items")
    .insert(itemRows(action.id, action.items));
  if (!inserted.error) return;

  const restored = action.previousItems.length
    ? await supabase
        .from("guide_items")
        .insert(itemRows(action.id, action.previousItems))
    : { error: null };
  const suffix = restored.error
    ? `; restore also failed: ${restored.error.message}`
    : "; previous items restored";
  throw new Error(
    `${action.slug}: item replacement failed: ${inserted.error.message}${suffix}`,
  );
}

async function applyPlan(supabase, plan) {
  for (const action of plan.actions) {
    if (action.kind === "create") {
      await createGuide(supabase, action);
      continue;
    }
    if (action.itemsChanged) await replaceItems(supabase, action);
    if (Object.keys(action.values).length) {
      const result = await supabase
        .from("guides")
        .update(action.values)
        .eq("id", action.id)
        .eq("slug", action.slug)
        .select("id")
        .single();
      if (result.error) {
        throw new Error(
          `${action.slug}: update failed: ${result.error.message}`,
        );
      }
    }
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const unknownArgs = process.argv
    .slice(2)
    .filter((arg) => arg !== "--dry-run");
  if (unknownArgs.length)
    throw new Error(`Unknown argument: ${unknownArgs[0]}`);

  const sources = loadSources();
  const validated = validateGuideSources(sources);
  console.log(`Source Guide files: ${sources.length}`);
  console.log(`Valid Guides: ${validated.guides.length}`);
  console.log(`Validation errors: ${validated.errors.length}`);
  if (validated.errors.length) throw new Error(validated.errors.join("\n"));

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
  const database = await loadDatabase(supabase);
  const plan = planGuideImport(
    validated.guides,
    database.guides,
    database.items,
  );

  console.log(`Guides to create: ${plan.toCreate}`);
  console.log(`Guides to update: ${plan.toUpdate}`);
  console.log(`Guides unchanged: ${plan.unchanged}`);
  console.log(`Item sets to synchronize: ${plan.itemSetsToSync}`);
  console.log(
    `Total source Items: ${validated.guides.reduce((total, guide) => total + guide.items.length, 0)}`,
  );
  console.log(`Orphan DB Guides: ${plan.orphanSlugs.length}`);
  for (const action of plan.actions) {
    const changes =
      action.kind === "create"
        ? [`create with ${action.items.length} items`]
        : [
            ...Object.keys(action.values).map((field) => `update ${field}`),
            ...(action.itemsChanged
              ? [`replace ${action.items.length} items`]
              : []),
          ];
    if (changes.length) console.log(`- ${action.slug}: ${changes.join(", ")}`);
  }

  if (dryRun) {
    console.log("Dry run: no writes performed.");
    return;
  }
  await applyPlan(supabase, plan);
  console.log("Guide import complete.");
}

await main();
