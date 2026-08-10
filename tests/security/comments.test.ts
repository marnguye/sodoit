import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("comments security", () => {
  it("allows User A to create, update, and delete their own comment", async () => {
    const fixture = getFixture();
    const id = crypto.randomUUID();

    const created = await fixture.userA
      .from("comments")
      .insert({
        id,
        post_id: fixture.postIds.b,
        author_id: fixture.aId,
        body: "User A temporary comment.",
      })
      .select("id")
      .single();

    expect(created.error).toBeNull();

    const updated = await fixture.userA
      .from("comments")
      .update({ body: "User A updated their comment." })
      .eq("id", id)
      .select("body")
      .single();

    expect(updated.error).toBeNull();
    expect(updated.data?.body).toBe("User A updated their comment.");

    expect(
      (await fixture.userA.from("comments").delete().eq("id", id)).error,
    ).toBeNull();

    expect(await adminRow(fixture, "comments", "id", id)).toBeNull();
  });

  it("blocks User A from forging or modifying User B comments", async () => {
    const fixture = getFixture();
    const forgedId = crypto.randomUUID();

    await fixture.userA.from("comments").insert({
      id: forgedId,
      post_id: fixture.postIds.b,
      author_id: fixture.bId,
      body: "This forged comment must not exist.",
    });

    await fixture.userA
      .from("comments")
      .update({ body: "hacked-by-a" })
      .eq("id", fixture.bCommentId);

    await fixture.userA.from("comments").delete().eq("id", fixture.bCommentId);

    expect(await adminRow(fixture, "comments", "id", forgedId)).toBeNull();

    const bComment = await adminRow(
      fixture,
      "comments",
      "id",
      fixture.bCommentId,
    );

    expect(bComment?.body).toBe("Temporary comment owned by User B.");
  });

  it("allows anon to read comments but blocks all anon comment writes", async () => {
    const fixture = getFixture();

    const read = await fixture.anon
      .from("comments")
      .select("id")
      .eq("id", fixture.bCommentId);

    expect(read.error).toBeNull();
    expect(read.data).toEqual([{ id: fixture.bCommentId }]);

    const forgedId = crypto.randomUUID();

    await fixture.anon.from("comments").insert({
      id: forgedId,
      post_id: fixture.postIds.b,
      author_id: fixture.aId,
      body: "Anon forged comment.",
    });

    await fixture.anon
      .from("comments")
      .update({ body: "hacked-by-anon" })
      .eq("id", fixture.bCommentId);

    await fixture.anon.from("comments").delete().eq("id", fixture.bCommentId);

    expect(await adminRow(fixture, "comments", "id", forgedId)).toBeNull();

    const bComment = await adminRow(
      fixture,
      "comments",
      "id",
      fixture.bCommentId,
    );

    expect(bComment?.body).toBe("Temporary comment owned by User B.");
  });
});
