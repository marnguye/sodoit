import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("experiences security", () => {
  it("allows anon and authenticated users to read public experiences", async () => {
    const fixture = getFixture();

    for (const actor of [fixture.anon, fixture.userA]) {
      const result = await actor
        .from("experiences")
        .select("id")
        .eq("id", fixture.experienceIds.main);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([{ id: fixture.experienceIds.main }]);
    }
  });

  it("blocks authenticated experience inserts, updates, and deletes", async () => {
    const fixture = getFixture();
    const forgedId = fixture.experienceIds.forgedAuthenticated;

    await fixture.userA.from("experiences").insert({
      id: forgedId,
      title: `Forged ${fixture.runId}`,
      category: "Adventure",
      is_public: true,
      saved_count: 0,
      completed_count: 0,
    });

    await fixture.userA
      .from("experiences")
      .update({ title: "User A changed this" })
      .eq("id", fixture.experienceIds.main);

    await fixture.userA
      .from("experiences")
      .delete()
      .eq("id", fixture.experienceIds.main);

    expect(await adminRow(fixture, "experiences", "id", forgedId)).toBeNull();

    const original = await adminRow(
      fixture,
      "experiences",
      "id",
      fixture.experienceIds.main,
    );

    expect(original?.title).toBe(`Security main ${fixture.runId}`);
  });

  it("blocks anon experience inserts, updates, and deletes", async () => {
    const fixture = getFixture();
    const forgedId = fixture.experienceIds.forgedAnon;

    await fixture.anon.from("experiences").insert({
      id: forgedId,
      title: `Anon forged ${fixture.runId}`,
      category: "Adventure",
      is_public: true,
      saved_count: 0,
      completed_count: 0,
    });

    await fixture.anon
      .from("experiences")
      .update({ title: "Anon changed this" })
      .eq("id", fixture.experienceIds.main);

    await fixture.anon
      .from("experiences")
      .delete()
      .eq("id", fixture.experienceIds.main);

    expect(await adminRow(fixture, "experiences", "id", forgedId)).toBeNull();

    const original = await adminRow(
      fixture,
      "experiences",
      "id",
      fixture.experienceIds.main,
    );

    expect(original?.title).toBe(`Security main ${fixture.runId}`);
  });
});
