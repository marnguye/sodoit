export const EXPERIENCE_DIFFICULTIES = ["Easy", "Medium", "Hard", "Extreme"];

const PRESENTATION = {
  Easy: { level: 1, tone: "positive" },
  Medium: { level: 2, tone: "caution" },
  Hard: { level: 3, tone: "warning" },
  Extreme: { level: 4, tone: "critical" },
};

export function isExperienceDifficulty(value) {
  return typeof value === "string" && EXPERIENCE_DIFFICULTIES.includes(value);
}

export function getDifficultyPresentation(difficulty) {
  if (!isExperienceDifficulty(difficulty)) return null;

  return { label: difficulty, ...PRESENTATION[difficulty] };
}
