import { describe, expect, it } from "vitest";
import { adminRow } from "./setup";
import { registerSecurityFixture } from "./fixture";

const getFixture = registerSecurityFixture();

describe("admin role security", () => {
  it("defaults new profiles to the user role", async () => {
    const fixture = getFixture();
    const profile = await adminRow(fixture, "profiles", "id", fixture.aId);

    expect(profile?.role).toBe("user");
  });

  it("blocks a user from self-assigning the admin role", async () => {
    const fixture = getFixture();

    const result = await fixture.userA
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", fixture.aId);

    expect(result.error).not.toBeNull();

    const profile = await adminRow(fixture, "profiles", "id", fixture.aId);
    expect(profile?.role).toBe("user");
  });

  it("blocks normal profile updates from changing role alongside allowed fields", async () => {
    const fixture = getFixture();

    const result = await fixture.userA
      .from("profiles")
      .update({ bio: "still-just-a-user", role: "admin" })
      .eq("id", fixture.aId);

    expect(result.error).not.toBeNull();

    const profile = await adminRow(fixture, "profiles", "id", fixture.aId);
    expect(profile?.role).toBe("user");
  });
});
