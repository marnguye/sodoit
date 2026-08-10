import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("legacy tables security", () => {
  it("keeps legacy completion tables fail-closed", async () => {
    const fixture = getFixture();

    const forgedCompletion = crypto.randomUUID();
    const forgedUserCompletion = crypto.randomUUID();

    await fixture.userA.from("completions").insert({
      id: forgedCompletion,
      user_id: fixture.aId,
      experience_id: fixture.experienceIds.main,
    });

    await fixture.userA
      .from("completions")
      .update({ note: "hacked-by-a" })
      .eq("id", fixture.legacyIds.completion);

    await fixture.userA
      .from("completions")
      .delete()
      .eq("id", fixture.legacyIds.completion);

    await fixture.userA.from("user_completions").insert({
      id: forgedUserCompletion,
      user_id: fixture.aId,
      experience_id: fixture.experienceIds.main,
    });

    await fixture.userA
      .from("user_completions")
      .delete()
      .eq("id", fixture.legacyIds.userCompletion);

    expect(
      await adminRow(fixture, "completions", "id", forgedCompletion),
    ).toBeNull();

    expect(
      await adminRow(fixture, "user_completions", "id", forgedUserCompletion),
    ).toBeNull();

    const completion = await adminRow(
      fixture,
      "completions",
      "id",
      fixture.legacyIds.completion,
    );

    expect(completion?.note).toBe(`security-${fixture.runId}`);

    expect(
      await adminRow(
        fixture,
        "user_completions",
        "id",
        fixture.legacyIds.userCompletion,
      ),
    ).not.toBeNull();
  });
});
