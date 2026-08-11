const COPY_FIELDS = ["title", "description", "image_alt"];
const ENTRY_KEYS = new Set(["slug", "public", "featured", ...COPY_FIELDS]);
const MAX_PUBLIC_EXPERIENCES = 50;

export function validateCuratedCatalog(value) {
  const errors = [];
  const experiences = Array.isArray(value?.experiences)
    ? value.experiences
    : [];

  if (!Array.isArray(value?.experiences))
    errors.push("experiences must be an array");
  if (experiences.length === 0) errors.push("Curated catalog cannot be empty");
  if (experiences.length > MAX_PUBLIC_EXPERIENCES) {
    errors.push(
      `Curated catalog exceeds ${MAX_PUBLIC_EXPERIENCES} public experiences`,
    );
  }

  const seen = new Set();
  for (const entry of experiences) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push("Every curated entry must be an object");
      continue;
    }

    if (typeof entry.slug !== "string" || !entry.slug.trim()) {
      errors.push("Every curated entry needs a non-empty slug");
      continue;
    }
    if (seen.has(entry.slug))
      errors.push(`Duplicate curated slug: ${entry.slug}`);
    seen.add(entry.slug);

    for (const key of Object.keys(entry)) {
      if (!ENTRY_KEYS.has(key))
        errors.push(`${entry.slug}: unknown field ${key}`);
    }
    if (entry.public !== true)
      errors.push(`${entry.slug}: curated entry must be public`);
    if (typeof entry.featured !== "boolean") {
      errors.push(`${entry.slug}: featured must be boolean`);
    }
    if (entry.featured && !entry.public) {
      errors.push(`${entry.slug}: featured entry must also be public`);
    }
    for (const field of COPY_FIELDS) {
      if (
        Object.hasOwn(entry, field) &&
        (typeof entry[field] !== "string" || !entry[field].trim())
      ) {
        errors.push(`${entry.slug}: ${field} must be a non-empty string`);
      }
    }
  }

  const decisions = [
    ...(value?.exact_duplicate_decisions ?? []),
    ...(value?.near_duplicate_decisions ?? []),
  ];
  for (const decision of decisions) {
    if (
      typeof decision?.canonical !== "string" ||
      !Array.isArray(decision.hidden) ||
      decision.hidden.length === 0
    ) {
      errors.push(
        "Duplicate decisions require a canonical slug and hidden slugs",
      );
      continue;
    }
    for (const slug of decision.hidden) {
      if (seen.has(slug)) {
        errors.push(`${slug}: duplicate row cannot be in the curated catalog`);
      }
    }
  }

  return {
    config: {
      experiences: [...experiences].sort((a, b) =>
        a.slug.localeCompare(b.slug),
      ),
      exact_duplicate_decisions: value?.exact_duplicate_decisions ?? [],
      near_duplicate_decisions: value?.near_duplicate_decisions ?? [],
    },
    errors,
  };
}

export function planCuratedCatalog(rows, config) {
  const catalogSlugs = new Set(rows.map(({ slug }) => slug));
  const configured = new Map(
    config.experiences.map((entry) => [entry.slug, entry]),
  );
  const decisionSlugs = [
    ...config.exact_duplicate_decisions,
    ...config.near_duplicate_decisions,
  ].flatMap(({ canonical, hidden }) => [canonical, ...hidden]);
  const missingSlugs = [...new Set([...configured.keys(), ...decisionSlugs])]
    .filter((slug) => !catalogSlugs.has(slug))
    .sort();
  const updates = [];

  for (const row of [...rows].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const entry = configured.get(row.slug);
    const values = entry
      ? {
          is_public: true,
          featured: entry.featured,
          ...Object.fromEntries(
            COPY_FIELDS.filter((field) => Object.hasOwn(entry, field)).map(
              (field) => [field, entry[field]],
            ),
          ),
        }
      : { is_public: false, featured: false };

    if (Object.entries(values).some(([key, value]) => row[key] !== value)) {
      updates.push({ id: row.id, slug: row.slug, values });
    }
  }

  return {
    currentPublic: rows.filter(({ is_public }) => is_public).length,
    currentFeatured: rows.filter(({ featured }) => featured).length,
    finalPublic: config.experiences.length,
    finalFeatured: config.experiences.filter(({ featured }) => featured).length,
    toHide: rows.filter((row) => row.is_public && !configured.has(row.slug))
      .length,
    toPublish: rows.filter((row) => !row.is_public && configured.has(row.slug))
      .length,
    missingSlugs,
    updates,
  };
}

function distribution(rows, key) {
  return Object.fromEntries(
    [...Map.groupBy(rows, (row) => row[key]).entries()]
      .map(([value, items]) => [value, items.length])
      .sort(([a], [b]) => String(a).localeCompare(String(b))),
  );
}

function exactTitleGroups(rows) {
  return [...Map.groupBy(rows, (row) => row.title.trim().toLowerCase())]
    .filter(([, items]) => items.length > 1)
    .map(([, items]) => ({
      title: items[0].title,
      slugs: items.map(({ slug }) => slug).sort(),
    }));
}

function repeatedDescriptionSentences(rows) {
  const sentences = rows.flatMap((row) =>
    String(row.description ?? "")
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length >= 40),
  );

  return [...Map.groupBy(sentences, (sentence) => sentence).entries()]
    .filter(([, items]) => items.length >= 3)
    .map(([sentence, items]) => ({ sentence, count: items.length }))
    .sort((a, b) => b.count - a.count || a.sentence.localeCompare(b.sentence));
}

export function buildCuratedCatalogAudit(rows, config, plan, references) {
  const configured = new Map(
    config.experiences.map((entry) => [entry.slug, entry]),
  );
  const weakTitle =
    /\b(local|something|somewhere|you have never|your city|new country|new city)\b/i;

  return {
    total: rows.length,
    current_public: plan.currentPublic,
    current_private: rows.length - plan.currentPublic,
    current_featured: rows
      .filter(({ featured }) => featured)
      .map(({ slug }) => slug)
      .sort(),
    category_distribution: distribution(rows, "category"),
    exact_duplicate_titles: exactTitleGroups(rows),
    exact_duplicate_decisions: config.exact_duplicate_decisions,
    near_duplicate_decisions: config.near_duplicate_decisions,
    missing_descriptions: rows
      .filter(({ description }) => !description)
      .map(({ slug }) => slug),
    missing_images: rows
      .filter(({ image_url }) => !image_url)
      .map(({ slug }) => slug),
    weak_generic_title_candidates: rows
      .filter(({ title }) => weakTitle.test(title))
      .map(({ slug }) => slug),
    repetitive_description_sentences: repeatedDescriptionSentences(rows),
    curated_public: config.experiences.map((entry) => {
      const row = rows.find(({ slug }) => slug === entry.slug);
      return {
        slug: entry.slug,
        title: entry.title ?? row?.title,
        category: row?.category,
        featured: entry.featured,
      };
    }),
    curated_category_distribution: distribution(
      rows.filter(({ slug }) => configured.has(slug)),
      "category",
    ),
    copy_changes: config.experiences.flatMap((entry) => {
      const row = rows.find(({ slug }) => slug === entry.slug);
      return COPY_FIELDS.filter(
        (field) => Object.hasOwn(entry, field) && row?.[field] !== entry[field],
      ).map((field) => ({
        slug: entry.slug,
        field,
        from: row?.[field],
        to: entry[field],
      }));
    }),
    hidden_references: references,
  };
}
