import { describe, expect, it } from "vitest";
import {
  getAchievementProgress,
  type AchievementDefinition,
} from "../../app/(app)/achievements/data";

const stats = {
  totalCompleted: 7,
  categoriesCompleted: new Set(["Food", "Travel"]),
  completedByCategory: new Map([["Travel", 3]]),
};

function definition(
  ruleType: AchievementDefinition["ruleType"],
  target = 1,
  ruleValue?: string,
): AchievementDefinition {
  return {
    id: "test",
    title: "Test",
    description: "Test",
    group: "General",
    ruleType,
    ruleValue,
    target,
    icon: "sparkles",
    sortOrder: 0,
  };
}

describe("achievement progress", () => {
  it("evaluates total completion", () => {
    expect(getAchievementProgress(definition("total_completed"), stats)).toBe(
      7,
    );
  });

  it("evaluates category diversity", () => {
    expect(
      getAchievementProgress(definition("categories_completed"), stats),
    ).toBe(2);
  });

  it("evaluates a category target", () => {
    expect(
      getAchievementProgress(
        definition("category_completed", 1, "Travel"),
        stats,
      ),
    ).toBe(3);
    expect(
      getAchievementProgress(
        definition("category_completed", 1, "Nature"),
        stats,
      ),
    ).toBe(0);
  });

  it("rejects malformed category rules", () => {
    expect(() =>
      getAchievementProgress(definition("category_completed"), stats),
    ).toThrow("ruleValue");
    expect(() =>
      getAchievementProgress(
        { ...definition("total_completed"), ruleType: "unknown" as never },
        stats,
      ),
    ).toThrow("Unsupported");
  });
});
