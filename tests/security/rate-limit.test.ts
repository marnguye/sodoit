import { describe, expect, it } from "vitest";
import { consumeRateLimit } from "../../lib/rate-limit";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe.sequential("rate limiting security", () => {
  it("allows five posts and blocks the sixth request", async () => {
    const fixture = getFixture();

    for (let index = 0; index < 5; index += 1) {
      const result = await consumeRateLimit(fixture.userA, "create_post");

      expect(result.allowed).toBe(true);
      expect(result.retryAfterSeconds).toBe(0);
    }

    const blocked = await consumeRateLimit(fixture.userA, "create_post");

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);

    const row = await adminRow(fixture, "rate_limits", "user_id", fixture.aId);

    expect(row?.action).toBe("create_post");
    expect(row?.request_count).toBe(5);
  });

  it("keeps rate limits isolated between users", async () => {
    const fixture = getFixture();

    const userA = await consumeRateLimit(fixture.userA, "create_post");

    expect(userA.allowed).toBe(false);

    const userB = await consumeRateLimit(fixture.userB, "create_post");

    expect(userB.allowed).toBe(true);
    expect(userB.retryAfterSeconds).toBe(0);
  });

  it("keeps post and comment limits independent", async () => {
    const fixture = getFixture();

    for (let index = 0; index < 10; index += 1) {
      const result = await consumeRateLimit(fixture.userA, "create_comment");

      expect(result.allowed).toBe(true);
    }

    const blockedComment = await consumeRateLimit(
      fixture.userA,
      "create_comment",
    );

    expect(blockedComment.allowed).toBe(false);

    const blockedPost = await consumeRateLimit(fixture.userA, "create_post");

    expect(blockedPost.allowed).toBe(false);
  });

  it("resets the limit after the window expires", async () => {
    const fixture = getFixture();

    const expiredWindow = new Date(Date.now() - 61_000).toISOString();

    const resetWindow = await fixture.admin
      .from("rate_limits")
      .update({
        window_started_at: expiredWindow,
      })
      .eq("user_id", fixture.aId)
      .eq("action", "create_post");

    expect(resetWindow.error).toBeNull();

    const result = await consumeRateLimit(fixture.userA, "create_post");

    expect(result.allowed).toBe(true);
    expect(result.retryAfterSeconds).toBe(0);

    const row = await fixture.admin
      .from("rate_limits")
      .select("request_count")
      .eq("user_id", fixture.aId)
      .eq("action", "create_post")
      .single();

    expect(row.error).toBeNull();
    expect(row.data?.request_count).toBe(1);
  });

  it("prevents authenticated users from tampering with rate-limit counters", async () => {
    const fixture = getFixture();

    const before = await fixture.admin
      .from("rate_limits")
      .select("request_count, window_started_at")
      .eq("user_id", fixture.aId)
      .eq("action", "create_post")
      .single();

    expect(before.error).toBeNull();

    await fixture.userA
      .from("rate_limits")
      .update({
        request_count: 0,
      })
      .eq("user_id", fixture.aId)
      .eq("action", "create_post");

    await fixture.userA
      .from("rate_limits")
      .delete()
      .eq("user_id", fixture.aId)
      .eq("action", "create_post");

    const after = await fixture.admin
      .from("rate_limits")
      .select("request_count, window_started_at")
      .eq("user_id", fixture.aId)
      .eq("action", "create_post")
      .single();

    expect(after.error).toBeNull();
    expect(after.data).toEqual(before.data);
  });
});
