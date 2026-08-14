import { describe, expect, it } from "vitest";
import {
  planGuideCityImport,
  validateGuideCitySource,
  validateGuideCitySources,
} from "../../scripts/content/lib/guide-cities.mjs";
import {
  planGuideImport,
  validateGuideSource,
  validateGuideSources,
} from "../../scripts/content/lib/guides.mjs";

function guideCity(overrides: Record<string, unknown> = {}) {
  return {
    slug: "prague",
    city: "Prague",
    country_code: "CZ",
    hero_image_url:
      "https://example.supabase.co/storage/v1/object/public/guide-images/prague/hero/prague-hero.webp",
    hero_image_alt: "View of Prague",
    eyebrow: "Prague",
    title: "Plans for a great day in Prague",
    description: "Pick a ready-made route.",
    ...overrides,
  };
}

function guide(overrides: Record<string, unknown> = {}) {
  return {
    slug: "first-time-in-prague",
    title: "First Time in Prague",
    description: "A concise introduction to Prague.",
    city: "Prague",
    country_code: "CZ",
    cover_image_url: null,
    cover_image_alt: null,
    duration_label: "1 day",
    is_public: false,
    featured: false,
    items: [
      {
        position: 0,
        title: "Start in Old Town",
        description: "Begin in the historic center.",
        place_name: "Old Town Square",
        image_url: null,
        image_alt: null,
        external_url: null,
      },
      {
        position: 1,
        title: "Cross the river",
        description: "Walk across Charles Bridge.",
        place_name: "Charles Bridge",
        image_url: null,
        image_alt: null,
        external_url: null,
      },
    ],
    ...overrides,
  };
}

function errorsFor(value: unknown) {
  return validateGuideSource(value, "test.json").errors.join("\n");
}

describe("Guide source validation", () => {
  it("accepts a valid Guide", () => {
    expect(validateGuideSource(guide()).errors).toEqual([]);
  });

  it.each([
    ["invalid slug", { slug: "First Time!" }, "slug"],
    ["lowercase country code", { country_code: "cz" }, "country_code"],
    ["empty city", { city: "  " }, "city"],
    ["empty items", { items: [] }, "items"],
    ["featured private Guide", { featured: true }, "featured"],
    ["unknown field", { surprise: true }, "surprise"],
  ])("rejects %s", (_name, overrides, path) => {
    expect(errorsFor(guide(overrides))).toContain(path);
  });

  it("rejects duplicate positions", () => {
    const value = guide();
    value.items[1].position = 0;
    expect(errorsFor(value)).toContain("duplicates position 0");
  });

  it("rejects non-contiguous positions", () => {
    const value = guide();
    value.items[1].position = 2;
    expect(errorsFor(value)).toContain("contiguous and ordered from 0");
  });

  it("rejects invalid external URLs", () => {
    const value = guide({
      items: guide().items.map((item, index) =>
        index === 0 ? { ...item, external_url: "javascript:alert(1)" } : item,
      ),
    });
    expect(errorsFor(value)).toContain("valid http/https URL");
  });

  it("rejects duplicate Guide slugs", () => {
    const result = validateGuideSources([
      { file: "a.json", value: guide() },
      { file: "b.json", value: guide() },
    ]);
    expect(result.errors).toContain(
      "first-time-in-prague: duplicate Guide slug",
    );
  });
});

describe("Guide import planning", () => {
  const source = guide();
  const existing = {
    id: "guide-id",
    ...source,
    items: undefined,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
  const existingItems = source.items.map((item, index) => ({
    id: `item-${index}`,
    guide_id: existing.id,
    ...item,
  }));

  it("is deterministic and leaves identical content unchanged", () => {
    const first = planGuideImport([source], [existing], existingItems);
    const second = planGuideImport(
      [source],
      [existing],
      [...existingItems].reverse(),
    );
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      toCreate: 0,
      toUpdate: 0,
      unchanged: 1,
      itemSetsToSync: 0,
    });
  });

  it("plans changed Guide fields without replacing identical items", () => {
    const changed = guide({ description: "Revised description." });
    const plan = planGuideImport([changed], [existing], existingItems);
    expect(plan.toUpdate).toBe(1);
    expect(plan.itemSetsToSync).toBe(0);
    expect(plan.actions[0]).toMatchObject({
      values: { description: "Revised description." },
    });
  });

  it("plans item synchronization when an item changes", () => {
    const changed = guide();
    changed.items[0].description = "Revised stop description.";
    const plan = planGuideImport([changed], [existing], existingItems);
    expect(plan.toUpdate).toBe(1);
    expect(plan.itemSetsToSync).toBe(1);
    expect(plan.actions[0]).toMatchObject({ itemsChanged: true });
  });
});

describe("Guide city source validation", () => {
  it("accepts valid metadata with or without a hero image", () => {
    expect(validateGuideCitySource(guideCity()).errors).toEqual([]);
    expect(
      validateGuideCitySource(
        guideCity({ hero_image_url: null, hero_image_alt: null }),
      ).errors,
    ).toEqual([]);
  });

  it.each([
    ["invalid slug", { slug: "Prague!" }, "slug"],
    ["lowercase country code", { country_code: "cz" }, "country_code"],
    ["empty title", { title: " " }, "title"],
    [
      "insecure image URL",
      {
        hero_image_url: "http://example.com/prague.webp",
      },
      "hero_image_url",
    ],
    ["missing image alt", { hero_image_alt: null }, "hero_image_alt"],
    ["unknown field", { surprise: true }, "surprise"],
  ])("rejects %s", (_name, overrides, path) => {
    expect(
      validateGuideCitySource(guideCity(overrides)).errors.join("\n"),
    ).toContain(path);
  });

  it("rejects duplicate slugs and locations", () => {
    const result = validateGuideCitySources([
      { file: "a.json", value: guideCity() },
      { file: "b.json", value: guideCity() },
    ]);
    expect(result.errors.join("\n")).toContain("duplicate city slug");
    expect(result.errors.join("\n")).toContain(
      "duplicate city and country_code",
    );
  });
});

describe("Guide city import planning", () => {
  it("plans create, update, and unchanged without deleting orphans", () => {
    const existing = guideCity({
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });
    const plan = planGuideCityImport(
      [
        guideCity(),
        guideCity({ slug: "brno", city: "Brno", title: "Plans in Brno" }),
        guideCity({
          slug: "vienna",
          city: "Vienna",
          country_code: "AT",
          title: "Revised Vienna plans",
        }),
      ],
      [
        existing,
        guideCity({
          slug: "vienna",
          city: "Vienna",
          country_code: "AT",
          title: "Old Vienna plans",
        }),
        guideCity({ slug: "orphan", city: "Paris", country_code: "FR" }),
      ],
    );

    expect(plan).toMatchObject({
      toCreate: 1,
      toUpdate: 1,
      unchanged: 1,
      orphanSlugs: ["orphan"],
    });
    expect(plan.actions.find(({ slug }) => slug === "vienna")).toMatchObject({
      values: { title: "Revised Vienna plans" },
    });
  });
});
