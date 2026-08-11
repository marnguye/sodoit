export function slugifyExperienceTitle(title) {
  return String(title ?? "")
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function planExperienceSlugBackfill(rows) {
  const occupied = new Set(rows.flatMap(({ slug }) => (slug ? [slug] : [])));
  const updates = [];
  let collisions = 0;

  for (const row of rows) {
    if (row.slug) continue;

    const idSuffix = row.id.replaceAll("-", "").toLowerCase();
    const base = slugifyExperienceTitle(row.title) || `experience-${idSuffix}`;
    let slug = base;

    if (occupied.has(slug)) {
      collisions += 1;
      slug = `${base}-${idSuffix.slice(0, 8)}`;
    }

    if (occupied.has(slug)) slug = `${base}-${idSuffix}`;

    for (let attempt = 2; occupied.has(slug); attempt += 1) {
      slug = `${base}-${idSuffix}-${attempt}`;
    }

    occupied.add(slug);
    updates.push({ id: row.id, slug });
  }

  return { updates, collisions };
}
