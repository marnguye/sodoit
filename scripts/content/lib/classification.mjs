const LOCATION_TYPES = new Set(["global", "country", "city"]);
const COUNTRY_CODE = /^[A-Z]{2}$/;
const ENTRY_KEYS = new Set([
  "slug",
  "location_type",
  "country_code",
  "city",
  "featured",
]);

export function validateClassificationConfig(value) {
  const errors = [];

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { config: null, errors: ["Config must be an object"] };
  }

  const countryCodes = Array.isArray(value.country_codes)
    ? value.country_codes
    : [];
  const experiences = Array.isArray(value.experiences) ? value.experiences : [];

  if (!Array.isArray(value.country_codes)) {
    errors.push("country_codes must be an array");
  }
  if (!Array.isArray(value.experiences)) {
    errors.push("experiences must be an array");
  }

  const allowedCodes = new Set();
  for (const code of countryCodes) {
    if (typeof code !== "string" || !COUNTRY_CODE.test(code)) {
      errors.push(`Invalid configured country code: ${String(code)}`);
    } else if (allowedCodes.has(code)) {
      errors.push(`Duplicate configured country code: ${code}`);
    } else {
      allowedCodes.add(code);
    }
  }

  const seen = new Set();
  for (const entry of experiences) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push("Every experience mapping must be an object");
      continue;
    }

    const slug = entry.slug;
    if (typeof slug !== "string" || !slug.trim()) {
      errors.push("Every experience mapping needs a non-empty slug");
      continue;
    }
    if (seen.has(slug)) errors.push(`Duplicate experience mapping: ${slug}`);
    seen.add(slug);

    for (const key of Object.keys(entry)) {
      if (!ENTRY_KEYS.has(key)) errors.push(`${slug}: unknown field ${key}`);
    }

    const hasLocation = Object.hasOwn(entry, "location_type");
    const hasCountry = Object.hasOwn(entry, "country_code");
    const hasCity = Object.hasOwn(entry, "city");

    if (!hasLocation && (hasCountry || hasCity)) {
      errors.push(`${slug}: location metadata requires location_type`);
    }

    if (hasLocation) {
      if (!LOCATION_TYPES.has(entry.location_type)) {
        errors.push(`${slug}: invalid location_type`);
      } else if (!hasCountry || !hasCity) {
        errors.push(`${slug}: location mapping requires country_code and city`);
      } else if (entry.location_type === "global") {
        if (entry.country_code !== null || entry.city !== null) {
          errors.push(`${slug}: global mapping cannot have location metadata`);
        }
      } else if (
        typeof entry.country_code !== "string" ||
        !COUNTRY_CODE.test(entry.country_code) ||
        !allowedCodes.has(entry.country_code)
      ) {
        errors.push(`${slug}: invalid or unconfigured country_code`);
      } else if (entry.location_type === "country" && entry.city !== null) {
        errors.push(`${slug}: country mapping must have city null`);
      } else if (
        entry.location_type === "city" &&
        (typeof entry.city !== "string" || !entry.city.trim())
      ) {
        errors.push(`${slug}: city mapping needs a non-empty city`);
      }
    }

    if (
      Object.hasOwn(entry, "featured") &&
      typeof entry.featured !== "boolean"
    ) {
      errors.push(`${slug}: featured must be boolean`);
    }
    if (!hasLocation && !Object.hasOwn(entry, "featured")) {
      errors.push(`${slug}: mapping has no classification or featured value`);
    }
  }

  return {
    config: {
      country_codes: [...allowedCodes].sort(),
      experiences: [...experiences].sort((a, b) =>
        String(a.slug).localeCompare(String(b.slug)),
      ),
    },
    errors,
  };
}

export function planExperienceClassification(rows, config) {
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  const missingSlugs = config.experiences
    .map(({ slug }) => slug)
    .filter((slug) => !bySlug.has(slug));
  const updates = [];

  for (const entry of config.experiences) {
    const row = bySlug.get(entry.slug);
    if (!row) continue;

    const values = {};
    if (Object.hasOwn(entry, "location_type")) {
      values.location_type = entry.location_type;
      values.country_code = entry.country_code;
      values.city = entry.city;
    }
    if (Object.hasOwn(entry, "featured")) values.featured = entry.featured;

    if (Object.entries(values).some(([key, value]) => row[key] !== value)) {
      updates.push({ id: row.id, slug: row.slug, values });
      Object.assign(row, values);
    }
  }

  const countBy = (key, values) =>
    Object.fromEntries(
      values.map((value) => [
        value,
        rows.filter((row) => row[key] === value).length,
      ]),
    );

  return {
    explicitClassifications: config.experiences.filter((entry) =>
      Object.hasOwn(entry, "location_type"),
    ).length,
    featured: rows.filter((row) => row.featured).length,
    locations: countBy("location_type", ["global", "country", "city"]),
    missingSlugs,
    unchanged: rows.length - updates.length,
    updates,
  };
}

function distribution(rows, key) {
  return Object.fromEntries(
    [...Map.groupBy(rows, (row) => row[key]).entries()]
      .filter(([value]) => value)
      .map(([value, items]) => [value, items.length])
      .sort(([a], [b]) => String(a).localeCompare(String(b))),
  );
}

function duplicates(rows, key) {
  return [...Map.groupBy(rows, (row) => String(row[key]).trim().toLowerCase())]
    .filter(([, items]) => items.length > 1)
    .map(([, items]) => ({
      value: items[0][key],
      slugs: items.map(({ slug }) => slug).sort(),
    }));
}

export function buildExperienceAudit(rows) {
  return {
    total: rows.length,
    categories: distribution(rows, "category"),
    location_types: distribution(rows, "location_type"),
    countries: distribution(rows, "country_code"),
    cities: distribution(
      rows.map((row) => ({
        ...row,
        place: row.city ? `${row.country_code}/${row.city}` : null,
      })),
      "place",
    ),
    featured: rows.filter((row) => row.featured).length,
    unclassified_global: rows.filter((row) => row.location_type === "global")
      .length,
    suspicious_duplicates: {
      titles: duplicates(rows, "title"),
      slugs: duplicates(rows, "slug"),
    },
    missing_description: rows
      .filter((row) => !row.description)
      .map(({ slug }) => slug),
    missing_image_url: rows
      .filter((row) => !row.image_url)
      .map(({ slug }) => slug),
  };
}
