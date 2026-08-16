import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("list visibility security", () => {
  it("hides a private list's rows from another user and anon", async () => {
    const fixture = getFixture();

    const asUserA = await fixture.userA
      .from("user_lists")
      .select("experience_id")
      .eq("user_id", fixture.bId)
      .eq("experience_id", fixture.experienceIds.privateList);

    const asAnon = await fixture.anon
      .from("user_lists")
      .select("experience_id")
      .eq("user_id", fixture.bId)
      .eq("experience_id", fixture.experienceIds.privateList);

    expect(asUserA.error).toBeNull();
    expect(asAnon.error).toBeNull();
    expect(asUserA.data).toEqual([]);
    expect(asAnon.data).toEqual([]);
  });

  it("exposes a public list's rows to another user and anon", async () => {
    const fixture = getFixture();

    const makePublic = await fixture.userB.from("user_list_settings").upsert(
      {
        user_id: fixture.bId,
        visibility: "public",
      },
      {
        onConflict: "user_id",
      },
    );

    expect(makePublic.error).toBeNull();

    const asUserA = await fixture.userA
      .from("user_lists")
      .select("experience_id")
      .eq("user_id", fixture.bId)
      .eq("experience_id", fixture.experienceIds.publicList);

    const asAnon = await fixture.anon
      .from("user_lists")
      .select("experience_id")
      .eq("user_id", fixture.bId)
      .eq("experience_id", fixture.experienceIds.publicList);

    expect(asUserA.error).toBeNull();
    expect(asAnon.error).toBeNull();

    expect(asUserA.data).toEqual([
      {
        experience_id: fixture.experienceIds.publicList,
      },
    ]);

    expect(asAnon.data).toEqual([
      {
        experience_id: fixture.experienceIds.publicList,
      },
    ]);

    const makePrivate = await fixture.userB
      .from("user_list_settings")
      .update({
        visibility: "private",
      })
      .eq("user_id", fixture.bId);

    expect(makePrivate.error).toBeNull();

    const afterPrivate = await fixture.anon
      .from("user_lists")
      .select("experience_id")
      .eq("user_id", fixture.bId)
      .eq("experience_id", fixture.experienceIds.publicList);

    expect(afterPrivate.error).toBeNull();
    expect(afterPrivate.data).toEqual([]);
  });

  it("blocks a user from writing another user's list settings", async () => {
    const fixture = getFixture();

    const created = await fixture.userB.from("user_list_settings").upsert(
      {
        user_id: fixture.bId,
        visibility: "private",
      },
      {
        onConflict: "user_id",
      },
    );

    expect(created.error).toBeNull();

    const unauthorizedUpdate = await fixture.userA
      .from("user_list_settings")
      .update({
        visibility: "public",
      })
      .eq("user_id", fixture.bId);

    expect(unauthorizedUpdate.error).toBeNull();

    const settings = await adminRow(
      fixture,
      "user_list_settings",
      "user_id",
      fixture.bId,
    );

    expect(settings?.visibility).toBe("private");
  });
});

describe("collections security", () => {
  it("lets a user create, read, and delete their own collection", async () => {
    const fixture = getFixture();

    const inserted = await fixture.userA
      .from("collections")
      .insert({
        user_id: fixture.aId,
        slug: `trips-${fixture.runId}`,
        name: "Trips",
      })
      .select("id, visibility")
      .single();

    expect(inserted.error).toBeNull();
    expect(inserted.data?.visibility).toBe("private");

    const read = await fixture.userA
      .from("collections")
      .select("id")
      .eq("id", inserted.data?.id)
      .single();

    expect(read.error).toBeNull();

    const removed = await fixture.userA
      .from("collections")
      .delete()
      .eq("id", inserted.data?.id);

    expect(removed.error).toBeNull();

    expect(
      await adminRow(fixture, "collections", "id", inserted.data?.id),
    ).toBeNull();
  });

  it("hides a private collection from other users and anon", async () => {
    const fixture = getFixture();

    const created = await fixture.userB
      .from("collections")
      .insert({
        user_id: fixture.bId,
        slug: `private-collection-${fixture.runId}`,
        name: "Private collection",
      })
      .select("id")
      .single();

    expect(created.error).toBeNull();

    const collectionId = created.data?.id;

    const asUserA = await fixture.userA
      .from("collections")
      .select("id")
      .eq("id", collectionId);

    const asAnon = await fixture.anon
      .from("collections")
      .select("id")
      .eq("id", collectionId);

    expect(asUserA.error).toBeNull();
    expect(asAnon.error).toBeNull();
    expect(asUserA.data).toEqual([]);
    expect(asAnon.data).toEqual([]);
  });

  it("exposes a public collection and its items to other users and anon", async () => {
    const fixture = getFixture();

    const created = await fixture.userB
      .from("collections")
      .insert({
        user_id: fixture.bId,
        slug: `public-collection-${fixture.runId}`,
        name: "Public collection",
        visibility: "public",
      })
      .select("id")
      .single();

    expect(created.error).toBeNull();

    const collectionId = created.data?.id;

    const inserted = await fixture.userB.from("collection_items").insert({
      collection_id: collectionId,
      experience_id: fixture.experienceIds.main,
    });

    expect(inserted.error).toBeNull();

    const asUserA = await fixture.userA
      .from("collection_items")
      .select("experience_id")
      .eq("collection_id", collectionId);

    const asAnon = await fixture.anon
      .from("collection_items")
      .select("experience_id")
      .eq("collection_id", collectionId);

    expect(asUserA.error).toBeNull();
    expect(asAnon.error).toBeNull();

    expect(asUserA.data).toEqual([
      { experience_id: fixture.experienceIds.main },
    ]);

    expect(asAnon.data).toEqual([
      { experience_id: fixture.experienceIds.main },
    ]);
  });

  it("blocks a user from mutating another user's collection or its items", async () => {
    const fixture = getFixture();

    const created = await fixture.userB
      .from("collections")
      .insert({
        user_id: fixture.bId,
        slug: `guarded-collection-${fixture.runId}`,
        name: "Guarded collection",
      })
      .select("id")
      .single();

    expect(created.error).toBeNull();

    const collectionId = created.data?.id;

    await fixture.userA
      .from("collections")
      .update({ name: "Hijacked" })
      .eq("id", collectionId);

    await fixture.userA.from("collections").delete().eq("id", collectionId);

    const unchanged = await adminRow(
      fixture,
      "collections",
      "id",
      collectionId,
    );

    expect(unchanged?.name).toBe("Guarded collection");

    await fixture.userA.from("collection_items").insert({
      collection_id: collectionId,
      experience_id: fixture.experienceIds.main,
    });

    const items = await fixture.admin
      .from("collection_items")
      .select("experience_id")
      .eq("collection_id", collectionId);

    expect(items.data).toEqual([]);
  });

  it("prevents duplicate collection items without erroring the caller", async () => {
    const fixture = getFixture();

    const created = await fixture.userA
      .from("collections")
      .insert({
        user_id: fixture.aId,
        slug: `dedupe-${fixture.runId}`,
        name: "Dedupe test",
      })
      .select("id")
      .single();

    expect(created.error).toBeNull();

    const collectionId = created.data?.id;

    const first = await fixture.userA.from("collection_items").insert({
      collection_id: collectionId,
      experience_id: fixture.experienceIds.ownList,
    });

    expect(first.error).toBeNull();

    const second = await fixture.userA.from("collection_items").upsert(
      {
        collection_id: collectionId,
        experience_id: fixture.experienceIds.ownList,
      },
      {
        onConflict: "collection_id,experience_id",
        ignoreDuplicates: true,
      },
    );

    expect(second.error).toBeNull();

    const items = await fixture.admin
      .from("collection_items")
      .select("experience_id")
      .eq("collection_id", collectionId);

    expect(items.data).toHaveLength(1);
  });

  it("rejects an unsafe collection slug", async () => {
    const fixture = getFixture();

    const result = await fixture.userA.from("collections").insert({
      user_id: fixture.aId,
      slug: "Not A Valid Slug!",
      name: "Bad slug",
    });

    expect(result.error).not.toBeNull();
  });
});
