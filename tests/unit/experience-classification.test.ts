import { describe, expect, it } from "vitest";
import {
  planExperienceClassification,
  validateClassificationConfig,
} from "../../scripts/content/lib/classification.mjs";

function validate(entry: Record<string, unknown>, countryCodes = ["FR", "JP"]) {
  return validateClassificationConfig({
    country_codes: countryCodes,
    experiences: [{ slug: "example", ...entry }],
  });
}

describe("classification validation", () => {
  it.each([
    [{ location_type: "global", country_code: null, city: null }],
    [{ location_type: "country", country_code: "JP", city: null }],
    [{ location_type: "city", country_code: "FR", city: "Paris" }],
  ])("accepts valid location mapping %#", (entry) => {
    expect(validate(entry).errors).toEqual([]);
  });

  it.each([
    [
      { location_type: "country", country_code: "jp", city: null },
      "invalid or unconfigured country_code",
    ],
    [
      { location_type: "country", country_code: "JP", city: "Tokyo" },
      "country mapping must have city null",
    ],
    [
      { location_type: "city", country_code: null, city: "Paris" },
      "invalid or unconfigured country_code",
    ],
    [
      { location_type: "global", country_code: "FR", city: "Paris" },
      "global mapping cannot have location metadata",
    ],
    [
      { location_type: "city", country_code: "FR", city: "" },
      "city mapping needs a non-empty city",
    ],
  ])("rejects invalid location mapping %#", (entry, message) => {
    expect(validate(entry).errors.join("\n")).toContain(message);
  });

  it("detects unknown slugs", () => {
    const config = validate({ featured: true }).config!;
    const plan = planExperienceClassification([], config);
    expect(plan.missingSlugs).toEqual(["example"]);
  });

  it("rejects duplicate mappings and sorts valid config deterministically", () => {
    const result = validateClassificationConfig({
      country_codes: [],
      experiences: [
        { slug: "z", featured: true },
        { slug: "a", featured: true },
        { slug: "z", featured: false },
      ],
    });

    expect(result.errors).toContain("Duplicate experience mapping: z");
    expect(result.config?.experiences.map(({ slug }) => slug)).toEqual([
      "a",
      "z",
      "z",
    ]);
  });
});
