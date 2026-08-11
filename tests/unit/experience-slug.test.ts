import { describe, expect, it } from "vitest";
import {
  planExperienceSlugBackfill,
  slugifyExperienceTitle,
} from "../../lib/experiences/slug.mjs";

describe("slugifyExperienceTitle", () => {
  it.each([
    ["See the Northern Lights", "see-the-northern-lights"],
    ["Český Krumlov", "cesky-krumlov"],
    ["São Paulo", "sao-paulo"],
    ["  Hello,   World!  ", "hello-world"],
    ["one---two___three", "one-two-three"],
    ["!!!", ""],
  ])("slugifies %j", (title, expected) => {
    expect(slugifyExperienceTitle(title)).toBe(expected);
  });

  it("is deterministic", () => {
    const title = "Crème brûlée & coffee";
    expect(slugifyExperienceTitle(title)).toBe(slugifyExperienceTitle(title));
  });
});

describe("planExperienceSlugBackfill", () => {
  it("preserves existing slugs and resolves title collisions with UUIDs", () => {
    const result = planExperienceSlugBackfill([
      {
        id: "00000000-0000-0000-0000-000000000001",
        title: "Visit Japan",
        slug: "visit-japan",
      },
      {
        id: "a1b2c3d4-0000-0000-0000-000000000002",
        title: "Visit Japan",
        slug: null,
      },
      { id: "00000000-0000-0000-0000-000000000003", title: "!!!", slug: null },
    ]);

    expect(result).toEqual({
      collisions: 1,
      updates: [
        {
          id: "a1b2c3d4-0000-0000-0000-000000000002",
          slug: "visit-japan-a1b2c3d4",
        },
        {
          id: "00000000-0000-0000-0000-000000000003",
          slug: "experience-00000000000000000000000000000003",
        },
      ],
    });
  });
});
