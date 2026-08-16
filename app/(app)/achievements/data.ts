import {
  Brain,
  Compass,
  Dumbbell,
  Heart,
  Leaf,
  Palette,
  Plane,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type AchievementRuleType =
  "total_completed" | "categories_completed" | "category_completed";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  group: string;
  ruleType: AchievementRuleType;
  ruleValue?: string;
  target: number;
  icon: string;
  sortOrder: number;
}

export interface AchievementStats {
  totalCompleted: number;
  categoriesCompleted: Set<string>;
  completedByCategory: Map<string, number>;
}

export function getAchievementProgress(
  definition: AchievementDefinition,
  stats: AchievementStats,
): number {
  switch (definition.ruleType) {
    case "total_completed":
      return stats.totalCompleted;
    case "categories_completed":
      return stats.categoriesCompleted.size;
    case "category_completed":
      if (!definition.ruleValue)
        throw new Error("category_completed requires ruleValue");
      return stats.completedByCategory.get(definition.ruleValue) ?? 0;
    default:
      throw new Error(
        `Unsupported achievement rule: ${String(definition.ruleType)}`,
      );
  }
}

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  brain: Brain,
  compass: Compass,
  dumbbell: Dumbbell,
  heart: Heart,
  leaf: Leaf,
  palette: Palette,
  plane: Plane,
  sparkles: Sparkles,
  utensils: UtensilsCrossed,
  users: Users,
  wrench: Wrench,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Adventure: Compass,
  Food: UtensilsCrossed,
  Travel: Plane,
  Mind: Brain,
  Fitness: Dumbbell,
  Nature: Leaf,
  Culture: Palette,
  Skills: Wrench,
  Lifestyle: Heart,
  Social: Users,
};

const CATEGORY_ACCENTS: Record<string, string> = {
  Adventure: "var(--color-accent)",
  Food: "var(--color-error)",
  Travel: "var(--color-info)",
  Mind: "var(--color-accent-dark)",
  Fitness: "var(--color-success)",
  Nature: "var(--color-success)",
  Culture: "var(--color-accent-dark)",
  Skills: "var(--color-warning)",
  Lifestyle: "var(--color-accent-dark)",
  Social: "var(--color-info)",
};

export function getAchievementIcon(iconKey: string): LucideIcon {
  return ACHIEVEMENT_ICONS[iconKey] ?? Sparkles;
}

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Sparkles;
}

export function getCategoryAccent(category: string): string {
  return CATEGORY_ACCENTS[category] ?? "var(--color-muted)";
}
