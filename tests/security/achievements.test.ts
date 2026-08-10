import { describe, expect, it } from "vitest";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe.sequential("achievements security", () => {
  it("rejects direct achievement writes", async () => {
    const fixture = getFixture();

    await fixture.userA.from("user_achievements").insert({
      user_id: fixture.aId,
      achievement_id: "peak-seeker",
    });

    await fixture.userA.from("user_achievements").insert({
      user_id: fixture.bId,
      achievement_id: "first-step",
    });

    const achievements = await fixture.admin
      .from("user_achievements")
      .select("achievement_id")
      .in("user_id", [fixture.aId, fixture.bId]);

    expect(achievements.error).toBeNull();
    expect(achievements.data).toEqual([]);
  });

  it("claims only User A's legitimately eligible achievement", async () => {
    const fixture = getFixture();

    const completed = await fixture.userA.from("user_lists").insert({
      user_id: fixture.aId,
      experience_id: fixture.experienceIds.achievement,
      status: "completed",
    });

    expect(completed.error).toBeNull();

    const forgedRpc = await fixture.userA.rpc("claim_achievements", {
      user_id: fixture.bId,
    });

    expect(forgedRpc.error).not.toBeNull();

    const claimed = await fixture.userA.rpc("claim_achievements");

    expect(claimed.error).toBeNull();
    expect(claimed.data).toEqual([{ achievement_id: "first-step" }]);

    const achievements = await fixture.admin
      .from("user_achievements")
      .select("user_id, achievement_id")
      .in("user_id", [fixture.aId, fixture.bId]);

    expect(achievements.error).toBeNull();

    expect(achievements.data).toEqual([
      {
        user_id: fixture.aId,
        achievement_id: "first-step",
      },
    ]);
  });

  it("blocks direct updates and deletes of earned achievements", async () => {
    const fixture = getFixture();

    await fixture.userA
      .from("user_achievements")
      .update({ achievement_id: "peak-seeker" })
      .eq("user_id", fixture.aId)
      .eq("achievement_id", "first-step");

    await fixture.userA
      .from("user_achievements")
      .delete()
      .eq("user_id", fixture.aId)
      .eq("achievement_id", "first-step");

    const result = await fixture.admin
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", fixture.aId);

    expect(result.error).toBeNull();

    expect(result.data).toEqual([{ achievement_id: "first-step" }]);
  });
});
