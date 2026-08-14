import { slugifyExperienceTitle } from "../../../lib/experiences/slug.mjs";

const CITY_FIELDS = [
  "slug",
  "city",
  "country_code",
  "hero_image_url",
  "hero_image_alt",
  "eyebrow",
  "title",
  "description",
];
const CITY_KEYS = new Set(CITY_FIELDS);
const COUNTRY_CODE = /^[A-Z]{2}$/;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function pick(value) {
  return Object.fromEntries(CITY_FIELDS.map((field) => [field, value[field]]));
}

export function validateGuideCitySource(value, file = "city.json") {
  const errors = [];
  const slug =
    isObject(value) && typeof value.slug === "string" ? value.slug : null;
  const label = slug ? `${file} (${slug})` : file;
  const error = (path, message) => errors.push(`${label}: ${path} ${message}`);

  if (!isObject(value)) {
    return { city: null, errors: [`${file}: Guide city must be an object`] };
  }

  for (const key of Object.keys(value)) {
    if (!CITY_KEYS.has(key)) error(key, "is unknown");
  }
  for (const key of CITY_KEYS) {
    if (!Object.hasOwn(value, key)) error(key, "is required");
  }

  if (
    typeof value.slug !== "string" ||
    !value.slug ||
    slugifyExperienceTitle(value.slug) !== value.slug
  ) {
    error("slug", "must be a normalized lowercase URL-safe slug");
  }
  for (const field of ["city", "eyebrow", "title", "description"]) {
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

  if (value.hero_image_url === null) {
    if (value.hero_image_alt !== null) {
      error("hero_image_alt", "must be null when hero_image_url is null");
    }
  } else {
    try {
      const url = new URL(value.hero_image_url);
      if (url.protocol !== "https:") throw new Error();
    } catch {
      error("hero_image_url", "must be null or a valid https URL");
    }
    if (
      typeof value.hero_image_alt !== "string" ||
      !value.hero_image_alt.trim()
    ) {
      error(
        "hero_image_alt",
        "must be a non-empty string when hero_image_url is set",
      );
    }
  }

  return { city: errors.length ? null : value, errors };
}

export function validateGuideCitySources(sources) {
  const errors = [];
  const cities = [];

  for (const { file, value } of [...sources].sort((a, b) =>
    a.file.localeCompare(b.file),
  )) {
    const result = validateGuideCitySource(value, file);
    errors.push(...result.errors);
    if (result.city) cities.push(result.city);
  }

  const slugs = new Set();
  const locations = new Set();
  for (const city of cities) {
    if (slugs.has(city.slug)) errors.push(`${city.slug}: duplicate city slug`);
    slugs.add(city.slug);

    const location = `${city.city}\0${city.country_code}`;
    if (locations.has(location)) {
      errors.push(`${city.slug}: duplicate city and country_code`);
    }
    locations.add(location);
  }

  return {
    cities: errors.length
      ? []
      : cities.sort((a, b) => a.slug.localeCompare(b.slug)),
    errors,
  };
}

export function planGuideCityImport(sourceCities, existingCities) {
  const existingBySlug = new Map(
    existingCities.map((city) => [city.slug, city]),
  );
  const sourceSlugs = new Set(sourceCities.map((city) => city.slug));
  const actions = [...sourceCities]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((source) => {
      const existing = existingBySlug.get(source.slug);
      if (!existing) {
        return { kind: "create", slug: source.slug, city: pick(source) };
      }

      const values = Object.fromEntries(
        CITY_FIELDS.filter(
          (field) => field !== "slug" && source[field] !== existing[field],
        ).map((field) => [field, source[field]]),
      );
      return { kind: "existing", slug: source.slug, values };
    });

  return {
    actions,
    toCreate: actions.filter(({ kind }) => kind === "create").length,
    toUpdate: actions.filter(
      (action) =>
        action.kind === "existing" && Object.keys(action.values).length > 0,
    ).length,
    unchanged: actions.filter(
      (action) =>
        action.kind === "existing" && Object.keys(action.values).length === 0,
    ).length,
    orphanSlugs: existingCities
      .map(({ slug }) => slug)
      .filter((slug) => !sourceSlugs.has(slug))
      .sort(),
  };
}
