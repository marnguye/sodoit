export interface Experience {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  difficulty: string | null;
  image_url: string | null;
  image_alt: string | null;
}
export type StatusFilter = "all" | "completed" | "uncompleted";
export type ListStatus = "saved" | "completed";

export const PAGE_SIZE = 30;

export const CATEGORIES = [
  "Adventure",
  "Culture",
  "Fitness",
  "Food",
  "Lifestyle",
  "Mind",
  "Nature",
  "Skills",
  "Social",
  "Travel",
] as const;

export function hashString(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

export const DIFFICULTIES = [
  { label: "Easy", color: "#16A34A" },
  { label: "Medium", color: "#F97316" },
  { label: "Hard", color: "#DC2626" },
] as const;

export const THUMBNAIL_HUES = [
  "#FED7AA",
  "#BAE6FD",
  "#BBF7D0",
  "#E9D5FF",
  "#FECACA",
] as const;

export interface TaskMeta {
  difficulty: (typeof DIFFICULTIES)[number];
  thumbnail: (typeof THUMBNAIL_HUES)[number];
}

export function getTaskMeta(id: string): TaskMeta {
  const hash = hashString(id);
  const difficulty = DIFFICULTIES[hash % DIFFICULTIES.length];
  const thumbnail = THUMBNAIL_HUES[hash % THUMBNAIL_HUES.length];
  return { difficulty, thumbnail };
}

export function getDifficulty(
  id: string,
  stored?: string | null,
): (typeof DIFFICULTIES)[number] {
  if (stored) {
    const matched = DIFFICULTIES.find(
      (difficulty) => difficulty.label.toLowerCase() === stored.toLowerCase(),
    );

    if (matched) {
      return matched;
    }
  }

  return getTaskMeta(id).difficulty;
}
