import {
  Compass,
  UtensilsCrossed,
  Plane,
  Brain,
  Dumbbell,
  Leaf,
  Palette,
  Wrench,
  Heart,
  Users,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export interface AchievementStats {
  totalCompleted: number;
  categoriesCompleted: Set<string>;
  completedByCategory: Map<string, number>;
}

export interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  target: number;
  progress: (stats: AchievementStats) => number;
}

export const MILESTONES: readonly MilestoneDef[] = [
  {
    id: "first-step",
    title: "First step",
    description: "Complete your first experience",
    icon: Sparkles,
    target: 1,
    progress: (stats) => stats.totalCompleted,
  },
  {
    id: "getting-started",
    title: "Getting started",
    description: "Complete 5 experiences",
    icon: Compass,
    target: 5,
    progress: (stats) => stats.totalCompleted,
  },
  {
    id: "adventurer",
    title: "Adventurer",
    description: "Complete 10 experiences",
    icon: Dumbbell,
    target: 10,
    progress: (stats) => stats.totalCompleted,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Complete experiences in 5 categories",
    icon: Leaf,
    target: 5,
    progress: (stats) => stats.categoriesCompleted.size,
  },
  {
    id: "world-traveler",
    title: "World traveler",
    description: "Complete 10 Travel experiences",
    icon: Plane,
    target: 10,
    progress: (stats) => stats.completedByCategory.get("Travel") ?? 0,
  },
  {
    id: "peak-seeker",
    title: "Peak seeker",
    description: "Complete 5 Adventure experiences",
    icon: Compass,
    target: 5,
    progress: (stats) => stats.completedByCategory.get("Adventure") ?? 0,
  },
];

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
  Adventure: "#F97316",
  Food: "#DC2626",
  Travel: "#0EA5E9",
  Mind: "#8B5CF6",
  Fitness: "#16A34A",
  Nature: "#65A30D",
  Culture: "#DB2777",
  Skills: "#CA8A04",
  Lifestyle: "#EC4899",
  Social: "#0891B2",
};

const DEFAULT_CATEGORY_ICON = Sparkles;
const DEFAULT_CATEGORY_ACCENT = "#78716C";

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? DEFAULT_CATEGORY_ICON;
}

export function getCategoryAccent(category: string): string {
  return CATEGORY_ACCENTS[category] ?? DEFAULT_CATEGORY_ACCENT;
}
