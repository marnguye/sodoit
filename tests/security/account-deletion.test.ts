import { describe, expect, it } from "vitest";
import { deleteAccountData } from "../../lib/account/delete-account";
import { consumeRateLimit } from "../../lib/rate-limit";
import { adminRow, storageBytes, storageObjectExists } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("account deletion security", () => {
  it("deletes User A and all owned data without changing User B or catalog data", async () => {
    const fixture = getFixture();

    const aCommentId = crypto.randomUUID();
    const aVoteId = crypto.randomUUID();
    const aCompletionId = crypto.randomUUID();

    const bProfileBefore = await adminRow(
      fixture,
      "profiles",
      "id",
      fixture.bId,
    );

    const bListBefore = await fixture.admin
      .from("user_lists")
      .select("id, status")
      .eq("user_id", fixture.bId)
      .eq("experience_id", fixture.experienceIds.privateList)
      .single();

    const bPostBefore = await adminRow(
      fixture,
      "posts",
      "id",
      fixture.postIds.b,
    );

    const bCommentBefore = await adminRow(
      fixture,
      "comments",
      "id",
      fixture.bCommentId,
    );

    const bAvatarBefore = await storageBytes(
      fixture,
      "avatars",
      fixture.storage.bAvatar,
    );

    const catalogBefore = await adminRow(
      fixture,
      "experiences",
      "id",
      fixture.experienceIds.main,
    );

    expect(bListBefore.error).toBeNull();

    const experience = await fixture.admin.from("experiences").insert({
      id: fixture.experienceIds.deletion,
      title: `Account deletion experience ${fixture.runId}`,
      category: "Adventure",
      description: "This catalog entry must survive its creator.",
      difficulty: "Easy",
      created_by: fixture.aId,
      is_public: true,
      saved_count: 0,
      completed_count: 0,
    });

    expect(experience.error).toBeNull();

    const preparedFixtures = await Promise.all([
      fixture.admin.from("user_lists").upsert({
        user_id: fixture.aId,
        experience_id: fixture.experienceIds.deletion,
        status: "completed",
      }),

      fixture.admin.from("user_achievements").upsert({
        user_id: fixture.aId,
        achievement_id: "first-step",
      }),

      fixture.admin.from("comments").insert({
        id: aCommentId,
        post_id: fixture.postIds.b,
        author_id: fixture.aId,
        body: "Account deletion fixture comment.",
      }),

      fixture.admin.from("post_votes").insert({
        id: aVoteId,
        post_id: fixture.postIds.a,
        user_id: fixture.aId,
      }),

      fixture.admin.from("completions").insert({
        id: aCompletionId,
        user_id: fixture.aId,
        experience_id: fixture.experienceIds.deletion,
        note: "Account deletion fixture completion.",
      }),

      fixture.admin.storage
        .from("avatars")
        .upload(fixture.storage.aAvatar, fixture.image, {
          contentType: "image/png",
          upsert: true,
        }),
    ]);

    for (const prepared of preparedFixtures) {
      expect(prepared.error).toBeNull();
    }

    const rateLimitConsumed = await consumeRateLimit(
      fixture.userA,
      "create_post",
    );

    expect(rateLimitConsumed.allowed).toBe(true);

    // A normal authenticated client must not have access
    // to Supabase Auth admin operations.
    const directAdminDelete = await fixture.userA.auth.admin.deleteUser(
      fixture.bId,
    );

    expect(directAdminDelete.error).not.toBeNull();

    const userBBeforeDelete = await fixture.admin.auth.admin.getUserById(
      fixture.bId,
    );

    expect(userBBeforeDelete.data.user?.id).toBe(fixture.bId);

    // Execute the same domain deletion helper used by the app.
    await deleteAccountData(fixture.admin, fixture.aId);

    // Auth user must be gone.
    const deletedAuth = await fixture.admin.auth.admin.getUserById(fixture.aId);

    expect(deletedAuth.data.user).toBeNull();

    // User A's previously authenticated client should
    // no longer resolve a valid user.
    const deletedSession = await fixture.userA.auth.getUser();

    expect(deletedSession.data.user).toBeNull();

    // Every owned database row must be gone.
    const ownedTables = [
      ["profiles", "id"],
      ["user_lists", "user_id"],
      ["completions", "user_id"],
      ["user_achievements", "user_id"],
      ["posts", "author_id"],
      ["comments", "author_id"],
      ["post_votes", "user_id"],
      ["rate_limits", "user_id"],
    ] as const;

    for (const [table, ownerColumn] of ownedTables) {
      const rows = await fixture.admin
        .from(table)
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq(ownerColumn, fixture.aId);

      expect(rows.error, `${table} cleanup query failed`).toBeNull();

      expect(rows.count, `${table} retained User A rows`).toBe(0);
    }

    // User A's Storage objects must be gone.
    expect(
      await storageObjectExists(fixture, "avatars", fixture.storage.aAvatar),
    ).toBe(false);

    // Catalog content survives account deletion.
    const retainedExperience = await adminRow(
      fixture,
      "experiences",
      "id",
      fixture.experienceIds.deletion,
    );

    expect(retainedExperience).not.toBeNull();
    expect(retainedExperience?.created_by).toBeNull();

    // User B must remain completely unchanged.
    expect(await adminRow(fixture, "profiles", "id", fixture.bId)).toEqual(
      bProfileBefore,
    );

    const bListAfter = await fixture.admin
      .from("user_lists")
      .select("id, status")
      .eq("user_id", fixture.bId)
      .eq("experience_id", fixture.experienceIds.privateList)
      .single();

    expect(bListAfter.error).toBeNull();
    expect(bListAfter.data).toEqual(bListBefore.data);

    expect(await adminRow(fixture, "posts", "id", fixture.postIds.b)).toEqual(
      bPostBefore,
    );

    expect(
      await adminRow(fixture, "comments", "id", fixture.bCommentId),
    ).toEqual(bCommentBefore);

    expect(
      await storageBytes(fixture, "avatars", fixture.storage.bAvatar),
    ).toEqual(bAvatarBefore);

    // Unrelated catalog data must also remain untouched.
    expect(
      await adminRow(fixture, "experiences", "id", fixture.experienceIds.main),
    ).toEqual(catalogBefore);
  }, 60_000);
});
