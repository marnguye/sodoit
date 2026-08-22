import { describe, expect, it } from "vitest";
import { formatCompactCount } from "../../lib/experiences/format";

describe("formatCompactCount", () => {
  it("renders small counts as-is", () => {
    expect(formatCompactCount(0)).toBe("0");
    expect(formatCompactCount(1)).toBe("1");
    expect(formatCompactCount(24)).toBe("24");
    expect(formatCompactCount(999)).toBe("999");
  });

  it("compacts thousands with one decimal", () => {
    expect(formatCompactCount(1240)).toBe("1.2k");
    expect(formatCompactCount(18400)).toBe("18.4k");
  });

  it("drops trailing .0", () => {
    expect(formatCompactCount(2000)).toBe("2k");
  });

  it("keeps one decimal for large thousands too", () => {
    expect(formatCompactCount(24500)).toBe("24.5k");
  });
});
