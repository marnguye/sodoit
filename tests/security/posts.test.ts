import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("posts security", () => {
  it("allows User A to create, update, and delete their own post", async () => {
    const fixture = getFixture();
    const id = crypto.randomUUID();

    const created = await fixture.userA
      .from("posts")
      .insert({
        id,
        author_id: fixture.aId,
        type: "tip",
        title: `User A test post ${fixture.runId}`,
        body: "A temporary security test post.",
      })
      .select("id")
      .single();

    expect(created.error).toBeNull();

    const updated = await fixture.userA
      .from("posts")
      .update({ body: "User A updated their own post." })
      .eq("id", id)
      .select("body")
      .single();

    expect(updated.error).toBeNull();
    expect(updated.data?.body).toBe("User A updated their own post.");

    expect(
      (await fixture.userA.from("posts").delete().eq("id", id)).error,
    ).toBeNull();

    expect(await adminRow(fixture, "posts", "id", id)).toBeNull();
  });

  it("blocks User A from forging or modifying User B posts", async () => {
    const fixture = getFixture();
    const forgedId = crypto.randomUUID();

    await fixture.userA.from("posts").insert({
      id: forgedId,
      author_id: fixture.bId,
      type: "tip",
      title: `Forged post ${fixture.runId}`,
      body: "This must never be inserted.",
    });

    await fixture.userA
      .from("posts")
      .update({ body: "hacked-by-a" })
      .eq("id", fixture.postIds.b);

    await fixture.userA.from("posts").delete().eq("id", fixture.postIds.b);

    expect(await adminRow(fixture, "posts", "id", forgedId)).toBeNull();

    const bPost = await adminRow(fixture, "posts", "id", fixture.postIds.b);

    expect(bPost?.body).toBe("Temporary post owned by User B.");
  });

  it("allows anon to read posts but blocks all anon post writes", async () => {
    const fixture = getFixture();

    const read = await fixture.anon
      .from("posts")
      .select("id")
      .eq("id", fixture.postIds.b);

    expect(read.error).toBeNull();
    expect(read.data).toEqual([{ id: fixture.postIds.b }]);

    const forgedId = crypto.randomUUID();

    await fixture.anon.from("posts").insert({
      id: forgedId,
      author_id: fixture.aId,
      type: "tip",
      title: `Anon forged post ${fixture.runId}`,
      body: "This must never be inserted.",
    });

    await fixture.anon
      .from("posts")
      .update({ body: "hacked-by-anon" })
      .eq("id", fixture.postIds.b);

    await fixture.anon.from("posts").delete().eq("id", fixture.postIds.b);

    expect(await adminRow(fixture, "posts", "id", forgedId)).toBeNull();

    const bPost = await adminRow(fixture, "posts", "id", fixture.postIds.b);

    expect(bPost?.body).toBe("Temporary post owned by User B.");
  });
});
