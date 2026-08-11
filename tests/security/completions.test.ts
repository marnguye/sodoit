import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("completion memories security", () => {
  it("keeps completions fail-closed for authenticated users", async () => {
    const fixture = getFixture();

    const forgedCompletion = crypto.randomUUID();

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

    expect(
      await adminRow(fixture, "completions", "id", forgedCompletion),
    ).toBeNull();

    const completion = await adminRow(
      fixture,
      "completions",
      "id",
      fixture.legacyIds.completion,
    );

    expect(completion?.note).toBe(`security-${fixture.runId}`);
  });
});
