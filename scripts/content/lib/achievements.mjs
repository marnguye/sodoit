const RULE_TYPES = new Set([
  "total_completed",
  "categories_completed",
  "category_completed",
]);
const FIELDS = [
  "id",
  "title",
  "description",
  "group",
  "ruleType",
  "ruleValue",
  "target",
  "icon",
  "sortOrder",
];
const KEYS = new Set(FIELDS);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function pick(value) {
  return {
    id: value.id,
    title: value.title,
    description: value.description,
    group: value.group,
    rule_type: value.ruleType,
    rule_value: value.ruleValue ?? null,
    target: value.target,
    icon: value.icon,
    sort_order: value.sortOrder,
  };
}

export function validateAchievementSource(value, file = "achievements.json") {
  const errors = [];
  const error = (path, message) => errors.push(`${file}: ${path} ${message}`);
  if (!Array.isArray(value)) {
    return { achievements: [], errors: [`${file}: must be an array`] };
  }

  value.forEach((item, index) => {
    const path = `${file}[${index}]`;
    if (!isObject(item)) {
      errors.push(`${path}: must be an object`);
      return;
    }
    for (const key of Object.keys(item))
      if (!KEYS.has(key)) error(`${path}.${key}`, "is unknown");
    for (const key of [
      "id",
      "title",
      "description",
      "group",
      "ruleType",
      "target",
      "icon",
      "sortOrder",
    ])
      if (!Object.hasOwn(item, key)) error(`${path}.${key}`, "is required");
    for (const key of ["id", "title", "description", "group", "icon"])
      if (typeof item[key] !== "string" || !item[key].trim())
        error(`${path}.${key}`, "must be a non-empty string");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id ?? ""))
      error(`${path}.id`, "must be a normalized slug");
    if (!RULE_TYPES.has(item.ruleType))
      error(`${path}.ruleType`, "is unsupported");
    if (
      item.ruleType === "category_completed" &&
      (typeof item.ruleValue !== "string" || !item.ruleValue.trim())
    )
      error(`${path}.ruleValue`, "is required for category_completed");
    if (item.ruleType !== "category_completed" && item.ruleValue !== undefined)
      error(`${path}.ruleValue`, "is only allowed for category_completed");
    if (!Number.isInteger(item.target) || item.target < 1)
      error(`${path}.target`, "must be a positive integer");
    if (!Number.isInteger(item.sortOrder) || item.sortOrder < 0)
      error(`${path}.sortOrder`, "must be a non-negative integer");
  });

  return { achievements: errors.length ? [] : value, errors };
}

export function validateAchievementSources(sources) {
  const errors = [];
  const achievements = [];
  for (const { file, value } of [...sources].sort((a, b) =>
    a.file.localeCompare(b.file),
  )) {
    const result = validateAchievementSource(value, file);
    errors.push(...result.errors);
    achievements.push(...result.achievements);
  }
  const ids = new Set();
  for (const achievement of achievements) {
    if (ids.has(achievement.id))
      errors.push(`${achievement.id}: duplicate achievement id`);
    ids.add(achievement.id);
  }
  return {
    achievements: errors.length
      ? []
      : achievements.sort(
          (a, b) =>
            a.group.localeCompare(b.group) ||
            a.sortOrder - b.sortOrder ||
            a.id.localeCompare(b.id),
        ),
    errors,
  };
}

export function planAchievementImport(source, existing) {
  const byId = new Map(existing.map((row) => [row.id, row]));
  const sourceIds = new Set(source.map((row) => row.id));
  const actions = source.map((item) => {
    const row = pick(item);
    const current = byId.get(item.id);
    if (!current) return { kind: "create", id: item.id, values: row };
    const values = Object.fromEntries(
      Object.keys(row)
        .filter((key) => key !== "id" && row[key] !== current[key])
        .map((key) => [key, row[key]]),
    );
    return {
      kind: Object.keys(values).length ? "update" : "unchanged",
      id: item.id,
      values,
    };
  });
  return {
    actions,
    toCreate: actions.filter((item) => item.kind === "create").length,
    toUpdate: actions.filter((item) => item.kind === "update").length,
    unchanged: actions.filter((item) => item.kind === "unchanged").length,
    orphanIds: existing.map((row) => row.id).filter((id) => !sourceIds.has(id)),
  };
}
