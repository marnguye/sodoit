import { describe, expect, it } from "vitest";
import {
  nextSlugCandidate,
  slugify,
} from "../../app/(app)/list/collections/slug";

describe("slugify", () => {
  it.each([
    ["2026", "2026"],
    ["Trips", "trips"],
    ["Weekend ideas", "weekend-ideas"],
    ["  Date   Night!!  ", "date-night"],
    ["Café stops", "cafe-stops"],
    ["<script>alert(1)</script>", "script-alert-1-script"],
    ["!!!", ""],
  ])("slugifies %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("never exceeds 60 characters", () => {
    const long = "a ".repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(60);
  });

  it("never trails a hyphen after truncation", () => {
    const long = "word ".repeat(30);
    expect(slugify(long).endsWith("-")).toBe(false);
  });
});

describe("nextSlugCandidate", () => {
  it("returns the base slug on the first attempt", () => {
    expect(nextSlugCandidate("trips", 0)).toBe("trips");
  });

  it("appends an incrementing numeric suffix on collisions", () => {
    expect(nextSlugCandidate("trips", 1)).toBe("trips-2");
    expect(nextSlugCandidate("trips", 2)).toBe("trips-3");
  });

  it("keeps the result within 60 characters", () => {
    const base = "a".repeat(60);
    expect(nextSlugCandidate(base, 1).length).toBeLessThanOrEqual(60);
  });
});
