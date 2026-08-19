import { describe, expect, it } from "vitest";
import { deleteAccountData } from "../../lib/account/delete-account";
import { consumeRateLimit } from "../../lib/rate-limit";
import { adminRow, storageBytes, storageObjectExists } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("account deletion security", () => {
  it("deletes User A and all owned data without changing User B or catalog data", async () => {
    const fixture = getFixture();

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
      slug: `account-deletion-experience-${fixture.runId}`,
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

    const directAdminDelete = await fixture.userA.auth.admin.deleteUser(
      fixture.bId,
    );

    expect(directAdminDelete.error).not.toBeNull();

    const userBBeforeDelete = await fixture.admin.auth.admin.getUserById(
      fixture.bId,
    );

    expect(userBBeforeDelete.data.user?.id).toBe(fixture.bId);

    await deleteAccountData(fixture.admin, fixture.aId);

    const deletedAuth = await fixture.admin.auth.admin.getUserById(fixture.aId);

    expect(deletedAuth.data.user).toBeNull();

    const deletedSession = await fixture.userA.auth.getUser();

    expect(deletedSession.data.user).toBeNull();

    const ownedTables = [
      ["profiles", "id"],
      ["user_lists", "user_id"],
      ["completions", "user_id"],
      ["user_achievements", "user_id"],
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

    expect(
      await storageObjectExists(fixture, "avatars", fixture.storage.aAvatar),
    ).toBe(false);

    const retainedExperience = await adminRow(
      fixture,
      "experiences",
      "id",
      fixture.experienceIds.deletion,
    );

    expect(retainedExperience).not.toBeNull();
    expect(retainedExperience?.created_by).toBeNull();

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

    expect(
      await storageBytes(fixture, "avatars", fixture.storage.bAvatar),
    ).toEqual(bAvatarBefore);

    expect(
      await adminRow(fixture, "experiences", "id", fixture.experienceIds.main),
    ).toEqual(catalogBefore);
  }, 60_000);
});
