import { SLUG_RE } from "@/lib/admin/slug";
import type { GuideType } from "@/lib/guides/types";

export const GUIDE_TITLE_MAX = 120;
export const GUIDE_DESCRIPTION_MAX = 2000;
export const GUIDE_TYPES: readonly GuideType[] = ["itinerary", "collection"];

export interface GuideInput {
  title: string;
  slug: string;
  description: string;
  type: string;
  city: string;
  country_code: string;
  city_slug: string;
  cover_image_url: string;
  cover_image_alt: string;
  duration_label: string;
  editorial_attribution: string;
  sort_order: number;
  featured: boolean;
  is_public: boolean;
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function validateGuideInput(input: GuideInput): string | null {
  if (!input.title) return "Title is required.";
  if (input.title.length > GUIDE_TITLE_MAX)
    return `Title must be ${GUIDE_TITLE_MAX} characters or fewer.`;

  if (!SLUG_RE.test(input.slug))
    return "Slug must be lowercase letters, numbers, and hyphens.";

  if (!GUIDE_TYPES.includes(input.type as GuideType))
    return "Choose a valid guide type.";

  if (!input.city) return "City is required.";

  if (!/^[A-Z]{2}$/.test(input.country_code))
    return "Country code must be 2 uppercase letters.";

  if (input.description.length > GUIDE_DESCRIPTION_MAX)
    return `Description must be ${GUIDE_DESCRIPTION_MAX} characters or fewer.`;

  if (input.cover_image_url && !isValidUrl(input.cover_image_url))
    return "Cover image URL must be a valid URL.";

  if (Number.isNaN(input.sort_order) || input.sort_order < 0)
    return "Sort order must be a non-negative number.";

  return null;
}

export function readGuideInput(formData: FormData): GuideInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    type: String(formData.get("type") ?? "itinerary"),
    city: String(formData.get("city") ?? "").trim(),
    country_code: String(formData.get("country_code") ?? "")
      .trim()
      .toUpperCase(),
    city_slug: String(formData.get("city_slug") ?? "").trim(),
    cover_image_url: String(formData.get("cover_image_url") ?? "").trim(),
    cover_image_alt: String(formData.get("cover_image_alt") ?? "").trim(),
    duration_label: String(formData.get("duration_label") ?? "").trim(),
    editorial_attribution: String(
      formData.get("editorial_attribution") ?? "",
    ).trim(),
    sort_order: Number(formData.get("sort_order") ?? 0),
    featured: formData.get("featured") === "on",
    is_public: formData.get("is_public") === "on",
  };
}

export interface GuideItemInput {
  title: string;
  description: string;
  place_name: string;
  image_url: string;
  image_alt: string;
  external_url: string;
}

export function readGuideItemInput(formData: FormData): GuideItemInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    place_name: String(formData.get("place_name") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim(),
    image_alt: String(formData.get("image_alt") ?? "").trim(),
    external_url: String(formData.get("external_url") ?? "").trim(),
  };
}

export function validateGuideItemInput(input: GuideItemInput): string | null {
  if (!input.title) return "Title is required.";
  if (input.image_url && !isValidUrl(input.image_url))
    return "Image URL must be a valid URL.";
  if (input.external_url && !isValidUrl(input.external_url))
    return "External URL must be a valid URL.";
  return null;
}
