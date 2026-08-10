import { describe, expect, it } from "vitest";
import { storageBytes, storageObjectExists } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("storage security", () => {
  it("allows User A to upload, overwrite, and delete only their avatar", async () => {
    const fixture = getFixture();

    const uploaded = await fixture.userA.storage
      .from("avatars")
      .upload(fixture.storage.aAvatar, fixture.image, {
        contentType: "image/png",
      });

    expect(uploaded.error).toBeNull();

    const replacement = Uint8Array.from([...fixture.image, 0]);

    const overwritten = await fixture.userA.storage
      .from("avatars")
      .upload(fixture.storage.aAvatar, replacement, {
        contentType: "image/png",
        upsert: true,
      });

    expect(overwritten.error).toBeNull();

    expect(
      await storageBytes(fixture, "avatars", fixture.storage.aAvatar),
    ).toEqual(replacement);

    const removed = await fixture.userA.storage
      .from("avatars")
      .remove([fixture.storage.aAvatar]);

    expect(removed.error).toBeNull();

    expect(
      await storageObjectExists(fixture, "avatars", fixture.storage.aAvatar),
    ).toBe(false);
  });

  it("blocks User A and anon from changing User B avatar objects", async () => {
    const fixture = getFixture();

    const original = await storageBytes(
      fixture,
      "avatars",
      fixture.storage.bAvatar,
    );

    await fixture.userA.storage
      .from("avatars")
      .upload(fixture.storage.bForgedAvatar, fixture.image, {
        contentType: "image/jpeg",
      });

    await fixture.userA.storage
      .from("avatars")
      .upload(fixture.storage.bAvatar, Uint8Array.from([...fixture.image, 1]), {
        contentType: "image/png",
        upsert: true,
      });

    await fixture.userA.storage
      .from("avatars")
      .remove([fixture.storage.bAvatar]);

    await fixture.anon.storage
      .from("avatars")
      .upload(fixture.storage.aAvatar, fixture.image, {
        contentType: "image/png",
      });

    await fixture.anon.storage
      .from("avatars")
      .remove([fixture.storage.bAvatar]);

    expect(
      await storageObjectExists(
        fixture,
        "avatars",
        fixture.storage.bForgedAvatar,
      ),
    ).toBe(false);

    expect(
      await storageObjectExists(fixture, "avatars", fixture.storage.bAvatar),
    ).toBe(true);

    expect(
      await storageBytes(fixture, "avatars", fixture.storage.bAvatar),
    ).toEqual(original);
  });

  it("allows public experience-image reads but blocks authenticated writes", async () => {
    const fixture = getFixture();

    for (const actor of [fixture.anon, fixture.userA]) {
      const read = await actor.storage
        .from("experience-images")
        .download(fixture.storage.experienceImage);

      expect(read.error).toBeNull();
    }

    const original = await storageBytes(
      fixture,
      "experience-images",
      fixture.storage.experienceImage,
    );

    await fixture.userA.storage
      .from("experience-images")
      .upload(fixture.storage.forgedExperienceImage, fixture.image, {
        contentType: "image/png",
      });

    await fixture.userA.storage
      .from("experience-images")
      .upload(
        fixture.storage.experienceImage,
        Uint8Array.from([...fixture.image, 2]),
        {
          contentType: "image/png",
          upsert: true,
        },
      );

    await fixture.userA.storage
      .from("experience-images")
      .remove([fixture.storage.experienceImage]);

    expect(
      await storageObjectExists(
        fixture,
        "experience-images",
        fixture.storage.forgedExperienceImage,
      ),
    ).toBe(false);

    expect(
      await storageObjectExists(
        fixture,
        "experience-images",
        fixture.storage.experienceImage,
      ),
    ).toBe(true);

    expect(
      await storageBytes(
        fixture,
        "experience-images",
        fixture.storage.experienceImage,
      ),
    ).toEqual(original);
  });

  it("blocks anon experience-image uploads, overwrites, and deletes", async () => {
    const fixture = getFixture();

    const original = await storageBytes(
      fixture,
      "experience-images",
      fixture.storage.experienceImage,
    );

    await fixture.anon.storage
      .from("experience-images")
      .upload(fixture.storage.forgedExperienceImage, fixture.image, {
        contentType: "image/png",
      });

    await fixture.anon.storage
      .from("experience-images")
      .upload(
        fixture.storage.experienceImage,
        Uint8Array.from([...fixture.image, 3]),
        {
          contentType: "image/png",
          upsert: true,
        },
      );

    await fixture.anon.storage
      .from("experience-images")
      .remove([fixture.storage.experienceImage]);

    expect(
      await storageObjectExists(
        fixture,
        "experience-images",
        fixture.storage.forgedExperienceImage,
      ),
    ).toBe(false);

    expect(
      await storageObjectExists(
        fixture,
        "experience-images",
        fixture.storage.experienceImage,
      ),
    ).toBe(true);

    expect(
      await storageBytes(
        fixture,
        "experience-images",
        fixture.storage.experienceImage,
      ),
    ).toEqual(original);
  });
});
