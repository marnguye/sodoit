export type Experience = { id: string; title: string; category: string | null };
export type StatusFilter = "all" | "completed" | "uncompleted";

export function hashString(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}
