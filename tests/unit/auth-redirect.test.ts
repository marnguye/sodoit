import { describe, expect, it } from "vitest";
import { getSafeNextPath, loginHrefWithNext } from "../../lib/auth-redirect";

describe("getSafeNextPath", () => {
  it("returns root for missing values", () => {
    expect(getSafeNextPath(null)).toBe("/");
    expect(getSafeNextPath(undefined)).toBe("/");
    expect(getSafeNextPath("")).toBe("/");
  });

  it("allows valid internal paths", () => {
    expect(getSafeNextPath("/")).toBe("/");
    expect(getSafeNextPath("/feed")).toBe("/feed");
    expect(getSafeNextPath("/settings/profile")).toBe("/settings/profile");
    expect(getSafeNextPath("/tasks/abc-123")).toBe("/tasks/abc-123");
  });

  it("preserves valid query strings and hashes", () => {
    expect(getSafeNextPath("/feed?tab=latest")).toBe("/feed?tab=latest");
    expect(getSafeNextPath("/settings/profile#account")).toBe(
      "/settings/profile#account",
    );
  });

  it("rejects absolute external URLs", () => {
    expect(getSafeNextPath("https://evil.example")).toBe("/");
    expect(getSafeNextPath("http://evil.example")).toBe("/");
  });

  it("rejects protocol-relative URLs", () => {
    expect(getSafeNextPath("//evil.example")).toBe("/");
    expect(getSafeNextPath("%2F%2Fevil.example")).toBe("/");
  });

  it("rejects paths containing backslashes", () => {
    expect(getSafeNextPath("/\\evil.example")).toBe("/");
    expect(getSafeNextPath("/%5Cevil.example")).toBe("/");
  });

  it("rejects control characters", () => {
    expect(getSafeNextPath("/feed%0Aevil")).toBe("/");
    expect(getSafeNextPath("/feed%00evil")).toBe("/");
  });

  it("rejects malformed URL encoding", () => {
    expect(getSafeNextPath("/feed%ZZ")).toBe("/");
  });

  it("rejects the obsolete /app route and its descendants", () => {
    expect(getSafeNextPath("/app")).toBe("/");
    expect(getSafeNextPath("/app/")).toBe("/");
    expect(getSafeNextPath("/app/settings")).toBe("/");
    expect(getSafeNextPath("/app?next=/feed")).toBe("/");
    expect(getSafeNextPath("/app#section")).toBe("/");
  });

  it("does not reject paths that merely start with the word app", () => {
    expect(getSafeNextPath("/apple")).toBe("/apple");
    expect(getSafeNextPath("/application")).toBe("/application");
  });
});

describe("loginHrefWithNext", () => {
  it("builds a login URL with an encoded internal path", () => {
    expect(loginHrefWithNext("/settings/profile")).toBe(
      "/login?next=%2Fsettings%2Fprofile",
    );
  });

  it("encodes query strings safely", () => {
    expect(loginHrefWithNext("/feed?tab=latest&page=2")).toBe(
      "/login?next=%2Ffeed%3Ftab%3Dlatest%26page%3D2",
    );
  });
});
