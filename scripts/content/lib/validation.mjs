import { normalizeWhitespace, slugify } from "./normalize.mjs";

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
];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function findCaseInsensitive(list, value) {
  return list.find((item) => item.toLowerCase() === value.toLowerCase());
}

export function validateRow(raw, rowNumber) {
  const errors = [];

  const title = normalizeWhitespace(raw.title);
  const description = normalizeWhitespace(raw.description);
  const category = normalizeWhitespace(raw.category);
  const difficulty = normalizeWhitespace(raw.difficulty);
  const imageQuery = normalizeWhitespace(raw.image_query);

  if (!title) {
    errors.push(`Row ${rowNumber}: missing title`);
  }

  if (!description) {
    errors.push(`Row ${rowNumber}: missing description`);
  }

  const matchedCategory = category
    ? findCaseInsensitive(CATEGORIES, category)
    : undefined;

  if (!category) {
    errors.push(`Row ${rowNumber}: missing category`);
  } else if (!matchedCategory) {
    errors.push(`Row ${rowNumber}: invalid category \`${category}\``);
  }

  const matchedDifficulty = difficulty
    ? findCaseInsensitive(DIFFICULTIES, difficulty)
    : undefined;

  if (!difficulty) {
    errors.push(`Row ${rowNumber}: missing difficulty`);
  } else if (!matchedDifficulty) {
    errors.push(`Row ${rowNumber}: invalid difficulty \`${difficulty}\``);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    row: {
      title,
      description,
      category: matchedCategory,
      difficulty: matchedDifficulty,
      imageQuery: imageQuery || null,
      slug: slugify(title),
    },
  };
}
