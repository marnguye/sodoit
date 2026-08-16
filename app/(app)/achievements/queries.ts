import { createClient } from "@/lib/supabase/server";
import type { AchievementDefinition, AchievementRuleType } from "./data";

interface AchievementRow {
  id: string;
  title: string;
  description: string;
  group: string;
  rule_type: AchievementRuleType;
  rule_value: string | null;
  target: number;
  icon: string;
  sort_order: number;
}

function toDefinition(row: AchievementRow): AchievementDefinition {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    group: row.group,
    ruleType: row.rule_type,
    ...(row.rule_value ? { ruleValue: row.rule_value } : {}),
    target: row.target,
    icon: row.icon,
    sortOrder: row.sort_order,
  };
}

export async function loadAchievementDefinitions(): Promise<
  AchievementDefinition[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("achievements")
    .select(
      "id, title, description, group, rule_type, rule_value, target, icon, sort_order",
    )
    .order("group")
    .order("sort_order");

  if (error) throw new Error("Could not load achievement definitions.");
  return ((data ?? []) as AchievementRow[]).map(toDefinition);
}
