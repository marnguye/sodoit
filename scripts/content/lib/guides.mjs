import { slugifyExperienceTitle } from "../../../lib/experiences/slug.mjs";

const GUIDE_FIELDS = [
  "slug",
  "title",
  "description",
  "city",
  "country_code",
  "cover_image_url",
  "cover_image_alt",
  "duration_label",
  "is_public",
  "featured",
];
const ITEM_FIELDS = [
  "position",
  "title",
  "description",
  "place_name",
  "image_url",
  "image_alt",
  "external_url",
];
const GUIDE_KEYS = new Set([...GUIDE_FIELDS, "items"]);
const ITEM_KEYS = new Set(ITEM_FIELDS);
const COUNTRY_CODE = /^[A-Z]{2}$/;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function pick(value, fields) {
  return Object.fromEntries(fields.map((field) => [field, value[field]]));
}

function sameFields(left, right, fields) {
  return fields.every((field) => left[field] === right[field]);
}

export function validateGuideSource(value, file = "guide.json") {
  const errors = [];
  const slug =
    isObject(value) && typeof value.slug === "string" ? value.slug : null;
  const label = slug ? `${file} (${slug})` : file;
  const error = (path, message) => errors.push(`${label}: ${path} ${message}`);

  if (!isObject(value)) {
    return { guide: null, errors: [`${file}: Guide must be an object`] };
  }

  for (const key of Object.keys(value)) {
    if (!GUIDE_KEYS.has(key)) error(key, "is unknown");
  }
  for (const key of GUIDE_KEYS) {
    if (!Object.hasOwn(value, key)) error(key, "is required");
  }

  if (
    typeof value.slug !== "string" ||
    !value.slug ||
    slugifyExperienceTitle(value.slug) !== value.slug
  ) {
    error("slug", "must be a normalized lowercase URL-safe slug");
  }
  for (const field of ["title", "city"]) {
    if (typeof value[field] !== "string" || !value[field].trim()) {
      error(field, "must be a non-empty string");
    }
  }
  if (
    typeof value.country_code !== "string" ||
    !COUNTRY_CODE.test(value.country_code)
  ) {
    error("country_code", "must be two uppercase ASCII letters");
  }
  for (const field of [
    "description",
    "cover_image_url",
    "cover_image_alt",
    "duration_label",
  ]) {
    if (
      value[field] !== null &&
      (typeof value[field] !== "string" || !value[field].trim())
    ) {
      error(field, "must be null or a non-empty string");
    }
  }
  for (const field of ["is_public", "featured"]) {
    if (typeof value[field] !== "boolean") error(field, "must be boolean");
  }
  if (value.featured === true && value.is_public !== true) {
    error("featured", "cannot be true while is_public is false");
  }

  if (!Array.isArray(value.items) || value.items.length === 0) {
    error("items", "must be a non-empty array");
  } else {
    const positions = new Set();
    const titles = new Set();

    value.items.forEach((item, index) => {
      const path = `items[${index}]`;
      if (!isObject(item)) {
        error(path, "must be an object");
        return;
      }
      for (const key of Object.keys(item)) {
        if (!ITEM_KEYS.has(key)) error(`${path}.${key}`, "is unknown");
      }
      for (const key of ITEM_KEYS) {
        if (!Object.hasOwn(item, key)) error(`${path}.${key}`, "is required");
      }

      if (!Number.isInteger(item.position) || item.position < 0) {
        error(`${path}.position`, "must be a non-negative integer");
      } else if (positions.has(item.position)) {
        error(`${path}.position`, `duplicates position ${item.position}`);
      } else {
        positions.add(item.position);
      }
      if (typeof item.title !== "string" || !item.title.trim()) {
        error(`${path}.title`, "must be a non-empty string");
      } else {
        const titleKey = item.title.trim().toLowerCase();
        if (titles.has(titleKey)) {
          error(`${path}.title`, "duplicates another item title");
        }
        titles.add(titleKey);
      }
      for (const field of [
        "description",
        "place_name",
        "image_url",
        "image_alt",
      ]) {
        if (
          item[field] !== null &&
          (typeof item[field] !== "string" || !item[field].trim())
        ) {
          error(`${path}.${field}`, "must be null or a non-empty string");
        }
      }
      if (item.external_url !== null) {
        try {
          const url = new URL(item.external_url);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error();
          }
        } catch {
          error(
            `${path}.external_url`,
            "must be null or a valid http/https URL",
          );
        }
      }
    });

    if (value.items.some((item, index) => item?.position !== index)) {
      error("items.position", "values must be contiguous and ordered from 0");
    }
  }

  return { guide: errors.length ? null : value, errors };
}

export function validateGuideSources(sources) {
  const errors = [];
  const guides = [];

  for (const { file, value } of [...sources].sort((a, b) =>
    a.file.localeCompare(b.file),
  )) {
    const result = validateGuideSource(value, file);
    errors.push(...result.errors);
    if (result.guide) guides.push(result.guide);
  }

  const seen = new Set();
  for (const guide of guides) {
    if (seen.has(guide.slug)) {
      errors.push(`${guide.slug}: duplicate Guide slug`);
    }
    seen.add(guide.slug);
  }

  return {
    guides: errors.length
      ? []
      : guides.sort((a, b) => a.slug.localeCompare(b.slug)),
    errors,
  };
}

export function planGuideImport(sourceGuides, existingGuides, existingItems) {
  const bySlug = new Map(existingGuides.map((guide) => [guide.slug, guide]));
  const itemsByGuide = Map.groupBy(existingItems, (item) => item.guide_id);
  const sourceSlugs = new Set(sourceGuides.map((guide) => guide.slug));
  const actions = [...sourceGuides]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((source) => {
      const existing = bySlug.get(source.slug);
      if (!existing) {
        return {
          kind: "create",
          slug: source.slug,
          guide: pick(source, GUIDE_FIELDS),
          items: source.items.map((item) => pick(item, ITEM_FIELDS)),
        };
      }

      const values = Object.fromEntries(
        GUIDE_FIELDS.filter(
          (field) => field !== "slug" && source[field] !== existing[field],
        ).map((field) => [field, source[field]]),
      );
      const previousItems = [...(itemsByGuide.get(existing.id) ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((item) => pick(item, ITEM_FIELDS));
      const items = source.items.map((item) => pick(item, ITEM_FIELDS));
      const itemsChanged =
        items.length !== previousItems.length ||
        items.some(
          (item, index) => !sameFields(item, previousItems[index], ITEM_FIELDS),
        );

      return {
        kind: "existing",
        id: existing.id,
        slug: source.slug,
        values,
        itemsChanged,
        items,
        previousItems,
      };
    });

  return {
    actions,
    toCreate: actions.filter(({ kind }) => kind === "create").length,
    toUpdate: actions.filter(
      (action) =>
        action.kind === "existing" &&
        (Object.keys(action.values).length > 0 || action.itemsChanged),
    ).length,
    unchanged: actions.filter(
      (action) =>
        action.kind === "existing" &&
        Object.keys(action.values).length === 0 &&
        !action.itemsChanged,
    ).length,
    itemSetsToSync: actions.filter(
      (action) => action.kind === "create" || action.itemsChanged,
    ).length,
    orphanSlugs: existingGuides
      .map(({ slug }) => slug)
      .filter((slug) => !sourceSlugs.has(slug))
      .sort(),
  };
}
