import { Bookmark, CheckCircle2, Search, type LucideIcon } from "lucide-react";

export interface BrowseStep {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const BROWSE_STEPS: BrowseStep[] = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description: "Find experiences and ideas worth trying.",
  },
  {
    number: "02",
    icon: Bookmark,
    title: "Save",
    description: "Build your personal list of things to do.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Complete",
    description: "Do them in the real world and track your progress.",
  },
];
