import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("user lists security", () => {
  it("allows User A to create, read, update, and delete their own list row", async () => {
    const fixture = getFixture();

    const inserted = await fixture.userA
      .from("user_lists")
      .insert({
        user_id: fixture.aId,
        experience_id: fixture.experienceIds.ownList,
        status: "saved",
      })
      .select("id, status")
      .single();

    expect(inserted.error).toBeNull();

    const read = await fixture.userA
      .from("user_lists")
      .select("id, status")
      .eq("id", inserted.data?.id)
      .single();

    expect(read.error).toBeNull();
    expect(read.data?.status).toBe("saved");

    const updated = await fixture.userA
      .from("user_lists")
      .update({ status: "completed" })
      .eq("id", inserted.data?.id)
      .select("status")
      .single();

    expect(updated.error).toBeNull();
    expect(updated.data?.status).toBe("completed");

    const removed = await fixture.userA
      .from("user_lists")
      .delete()
      .eq("id", inserted.data?.id);

    expect(removed.error).toBeNull();

    expect(
      await adminRow(fixture, "user_lists", "id", inserted.data?.id),
    ).toBeNull();
  });

  it("blocks User A from inserting, updating, or deleting User B list rows", async () => {
    const fixture = getFixture();
    const forgedId = crypto.randomUUID();

    await fixture.userA.from("user_lists").insert({
      id: forgedId,
      user_id: fixture.bId,
      experience_id: fixture.experienceIds.main,
      status: "saved",
    });

    expect(await adminRow(fixture, "user_lists", "id", forgedId)).toBeNull();

    const bPrivate = await fixture.admin
      .from("user_lists")
      .select("id")
      .eq("user_id", fixture.bId)
      .eq("experience_id", fixture.experienceIds.privateList)
      .single();

    expect(bPrivate.error).toBeNull();

    const bListId = bPrivate.data?.id;

    await fixture.userA
      .from("user_lists")
      .update({ status: "completed" })
      .eq("id", bListId);

    await fixture.userA.from("user_lists").delete().eq("id", bListId);

    const unchanged = await adminRow(fixture, "user_lists", "id", bListId);

    expect(unchanged?.status).toBe("saved");
    expect(unchanged?.user_id).toBe(fixture.bId);
  });

  it("exposes completed list rows publicly without leaking private rows", async () => {
    const fixture = getFixture();

    const result = await fixture.anon
      .from("user_lists")
      .select("experience_id, status")
      .eq("user_id", fixture.bId)
      .in("experience_id", [
        fixture.experienceIds.privateList,
        fixture.experienceIds.publicList,
      ]);

    expect(result.error).toBeNull();

    expect(result.data).toEqual([
      {
        experience_id: fixture.experienceIds.publicList,
        status: "completed",
      },
    ]);
  });

  it("lets a user resolve their own hidden Experience without exposing it anonymously", async () => {
    const fixture = getFixture();
    const experienceId = fixture.experienceIds.ownList;

    expect(
      (
        await fixture.admin
          .from("experiences")
          .update({ is_public: false })
          .eq("id", experienceId)
      ).error,
    ).toBeNull();
    expect(
      (
        await fixture.userA.from("user_lists").insert({
          user_id: fixture.aId,
          experience_id: experienceId,
          status: "saved",
        })
      ).error,
    ).toBeNull();

    const own = await fixture.userA
      .from("experiences")
      .select("id")
      .eq("id", experienceId);
    const anonymous = await fixture.anon
      .from("experiences")
      .select("id")
      .eq("id", experienceId);

    expect(own.data).toEqual([{ id: experienceId }]);
    expect(anonymous.data).toEqual([]);
  });
});
