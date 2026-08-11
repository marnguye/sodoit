import { describe, expect, it } from "vitest";
import {
  planCuratedCatalog,
  validateCuratedCatalog,
} from "../../scripts/content/lib/curation.mjs";

const entry = { slug: "keep", public: true, featured: false };
const config = {
  experiences: [entry],
  exact_duplicate_decisions: [],
  near_duplicate_decisions: [],
};
const rows = [
  { id: "2", slug: "hide", title: "Hide", is_public: true, featured: true },
  { id: "1", slug: "keep", title: "Keep", is_public: false, featured: false },
];

describe("curated catalog validation", () => {
  it("rejects empty and excessive catalogs", () => {
    expect(validateCuratedCatalog({ experiences: [] }).errors).toContain(
      "Curated catalog cannot be empty",
    );
    expect(
      validateCuratedCatalog({
        experiences: Array.from({ length: 51 }, (_, index) => ({
          ...entry,
          slug: `item-${index}`,
        })),
      }).errors,
    ).toContain("Curated catalog exceeds 50 public experiences");
  });

  it("rejects duplicate slugs and featured private entries", () => {
    const result = validateCuratedCatalog({
      experiences: [
        entry,
        entry,
        { ...entry, slug: "private", public: false, featured: true },
      ],
    });
    expect(result.errors).toContain("Duplicate curated slug: keep");
    expect(result.errors).toContain(
      "private: featured entry must also be public",
    );
  });

  it("detects unknown curated slugs", () => {
    expect(planCuratedCatalog([], config).missingSlugs).toEqual(["keep"]);
  });

  it("hides and unfeatures non-curated rows", () => {
    const plan = planCuratedCatalog(structuredClone(rows), config);
    expect(plan.updates.find(({ slug }) => slug === "hide")?.values).toEqual({
      is_public: false,
      featured: false,
    });
  });

  it("updates copy only for explicitly configured rows", () => {
    const plan = planCuratedCatalog(structuredClone(rows), {
      ...config,
      experiences: [{ ...entry, title: "Better title" }],
    });
    expect(plan.updates).toEqual([
      {
        id: "2",
        slug: "hide",
        values: { is_public: false, featured: false },
      },
      {
        id: "1",
        slug: "keep",
        values: { is_public: true, featured: false, title: "Better title" },
      },
    ]);
  });

  it("generates the same sorted plan regardless of row order", () => {
    const forward = planCuratedCatalog(structuredClone(rows), config).updates;
    const reverse = planCuratedCatalog(
      structuredClone(rows.reverse()),
      config,
    ).updates;
    expect(reverse).toEqual(forward);
  });
});
