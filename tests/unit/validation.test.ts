import { describe, expect, it } from "vitest";
import {
  BIO_MAX_LENGTH,
  COMMENT_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  POST_BODY_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  USERNAME_RE,
  UUID_RE,
} from "../../lib/validation";

describe("USERNAME_RE", () => {
  it("accepts valid usernames", () => {
    expect(USERNAME_RE.test("abc")).toBe(true);
    expect(USERNAME_RE.test("john_doe")).toBe(true);
    expect(USERNAME_RE.test("john-doe")).toBe(true);
    expect(USERNAME_RE.test("user123")).toBe(true);
    expect(USERNAME_RE.test("a".repeat(24))).toBe(true);
  });

  it("rejects invalid usernames", () => {
    expect(USERNAME_RE.test("ab")).toBe(false);
    expect(USERNAME_RE.test("a".repeat(25))).toBe(false);
    expect(USERNAME_RE.test("JohnDoe")).toBe(false);
    expect(USERNAME_RE.test("john.doe")).toBe(false);
    expect(USERNAME_RE.test("john doe")).toBe(false);
    expect(USERNAME_RE.test("john@doe")).toBe(false);
    expect(USERNAME_RE.test("")).toBe(false);
  });
});

describe("UUID_RE", () => {
  it("accepts valid UUIDs", () => {
    expect(UUID_RE.test("550e8400-e29b-41d4-a716-446655440000")).toBe(true);

    expect(UUID_RE.test("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true);
  });

  it("accepts uppercase UUID characters", () => {
    expect(UUID_RE.test("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("rejects malformed UUIDs", () => {
    expect(UUID_RE.test("550e8400e29b41d4a716446655440000")).toBe(false);
    expect(UUID_RE.test("not-a-uuid")).toBe(false);
    expect(UUID_RE.test("")).toBe(false);
    expect(UUID_RE.test("550e8400-e29b-01d4-a716-446655440000")).toBe(false);
  });
});

describe("validation limits", () => {
  it("keeps expected profile limits", () => {
    expect(BIO_MAX_LENGTH).toBe(160);
    expect(PASSWORD_MIN_LENGTH).toBe(8);
  });

  it("keeps expected post and comment limits", () => {
    expect(POST_TITLE_MAX_LENGTH).toBe(140);
    expect(POST_BODY_MAX_LENGTH).toBe(10_000);
    expect(COMMENT_MAX_LENGTH).toBe(2_000);
  });
});
