import { describe, expect, it } from "vitest";
import { requireEnv } from "../../lib/env/validate";

describe("requireEnv", () => {
  it("returns configured value", () => {
    expect(requireEnv("TEST_ENV", "configured")).toBe("configured");
  });

  it("trims configured value", () => {
    expect(requireEnv("TEST_ENV", "  configured  ")).toBe("configured");
  });

  it("rejects missing value", () => {
    expect(() => requireEnv("TEST_ENV", undefined)).toThrow(
      "Missing required environment variable: TEST_ENV",
    );
  });

  it("rejects empty value", () => {
    expect(() => requireEnv("TEST_ENV", "   ")).toThrow(
      "Missing required environment variable: TEST_ENV",
    );
  });
});
