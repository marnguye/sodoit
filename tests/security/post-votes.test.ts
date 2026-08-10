import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("post votes security", () => {
  it("allows User A to create and delete only their own post vote", async () => {
    const fixture = getFixture();
    const ownVoteId = crypto.randomUUID();

    const created = await fixture.userA.from("post_votes").insert({
      id: ownVoteId,
      post_id: fixture.postIds.b,
      user_id: fixture.aId,
    });

    expect(created.error).toBeNull();

    const forgedId = crypto.randomUUID();

    await fixture.userA.from("post_votes").insert({
      id: forgedId,
      post_id: fixture.postIds.a,
      user_id: fixture.bId,
    });

    await fixture.userA.from("post_votes").delete().eq("id", fixture.bVoteId);

    expect(await adminRow(fixture, "post_votes", "id", forgedId)).toBeNull();

    expect(
      await adminRow(fixture, "post_votes", "id", fixture.bVoteId),
    ).not.toBeNull();

    expect(
      (await fixture.userA.from("post_votes").delete().eq("id", ownVoteId))
        .error,
    ).toBeNull();

    expect(await adminRow(fixture, "post_votes", "id", ownVoteId)).toBeNull();
  });
});
