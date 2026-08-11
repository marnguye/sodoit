import { slugifyExperienceTitle } from "../../../lib/experiences/slug.mjs";

export function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value) {
  return slugifyExperienceTitle(value);
}
