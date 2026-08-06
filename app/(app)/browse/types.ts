export type Experience = { id: string; title: string; category: string | null };
export type StatusFilter = "all" | "completed" | "uncompleted";
export type ListStatus = "saved" | "completed";

export function hashString(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

export const DIFFICULTIES = [
  { label: "Easy", xp: 10, color: "#16A34A" },
  { label: "Medium", xp: 25, color: "#F97316" },
  { label: "Hard", xp: 50, color: "#DC2626" },
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
  adoption: number;
  completions: number;
}

export function getTaskMeta(id: string): TaskMeta {
  const hash = hashString(id);
  const difficulty = DIFFICULTIES[hash % DIFFICULTIES.length];
  const thumbnail = THUMBNAIL_HUES[hash % THUMBNAIL_HUES.length];
  const adoption = 50 + (hash % 950);
  const completions = Math.floor(adoption * (0.2 + (hash % 50) / 100));
  return { difficulty, thumbnail, adoption, completions };
}
