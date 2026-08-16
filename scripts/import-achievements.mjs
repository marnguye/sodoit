import { readdirSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  planAchievementImport,
  validateAchievementSources,
} from "./content/lib/achievements.mjs";

const directory = new URL("./content/achievements/", import.meta.url);
const columns =
  "id, title, description, group, rule_type, rule_value, target, icon, sort_order";
const sources = readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => ({
    file,
    value: JSON.parse(readFileSync(new URL(file, directory), "utf8")),
  }));
const validation = validateAchievementSources(sources);
if (validation.errors.length) throw new Error(validation.errors.join("\n"));

const dryRun = process.argv.includes("--dry-run");
const unknown = process.argv.slice(2).filter((arg) => arg !== "--dry-run");
if (unknown.length) throw new Error(`Unknown argument: ${unknown[0]}`);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});
const result = await supabase.from("achievements").select(columns).order("id");
if (result.error) throw new Error(`Load achievements: ${result.error.message}`);
const plan = planAchievementImport(validation.achievements, result.data ?? []);
console.log(`Source achievements: ${validation.achievements.length}`);
console.log(`To create: ${plan.toCreate}`);
console.log(`To update: ${plan.toUpdate}`);
console.log(`Unchanged: ${plan.unchanged}`);
console.log(`Orphan records: ${plan.orphanIds.length}`);
if (dryRun) {
  console.log("Dry run: no writes performed.");
} else {
  for (const action of plan.actions) {
    if (action.kind === "unchanged") continue;
    const response =
      action.kind === "create"
        ? await supabase.from("achievements").insert(action.values)
        : await supabase
            .from("achievements")
            .update(action.values)
            .eq("id", action.id);
    if (response.error)
      throw new Error(
        `${action.id}: ${action.kind} failed: ${response.error.message}`,
      );
  }
  console.log("Achievement import complete.");
}
