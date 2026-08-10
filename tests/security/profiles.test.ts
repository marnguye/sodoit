import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("profiles security", () => {
  it("allows User A to update only their own profile", async () => {
    const fixture = getFixture();
    const ownBio = `updated-a-${fixture.runId}`;

    const result = await fixture.userA
      .from("profiles")
      .update({ bio: ownBio })
      .eq("id", fixture.aId)
      .select("id, bio");

    expect(result.error).toBeNull();
    expect(result.data).toEqual([{ id: fixture.aId, bio: ownBio }]);

    await fixture.userA
      .from("profiles")
      .update({ bio: "hacked-by-a" })
      .eq("id", fixture.bId);

    const bProfile = await adminRow(fixture, "profiles", "id", fixture.bId);

    expect(bProfile?.bio).toBe(`security-b-${fixture.runId}`);
  });

  it("blocks anon profile updates", async () => {
    const fixture = getFixture();

    await fixture.anon
      .from("profiles")
      .update({ bio: "hacked-by-anon" })
      .eq("id", fixture.bId);

    const bProfile = await adminRow(fixture, "profiles", "id", fixture.bId);

    expect(bProfile?.bio).toBe(`security-b-${fixture.runId}`);
  });
});
