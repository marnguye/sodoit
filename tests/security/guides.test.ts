import { describe, expect, it } from "vitest";
import { registerSecurityFixture } from "./fixture";
import { adminRow } from "./setup";

const getFixture = registerSecurityFixture();

describe("guides security", () => {
  it("exposes only public guides and their items", async () => {
    const fixture = getFixture();

    for (const actor of [fixture.anon, fixture.userA]) {
      const guides = await actor
        .from("guides")
        .select("id")
        .in("id", [fixture.guideIds.public, fixture.guideIds.private]);
      const items = await actor
        .from("guide_items")
        .select("id")
        .in("id", [fixture.guideItemIds.public, fixture.guideItemIds.private]);

      expect(guides.error).toBeNull();
      expect(guides.data).toEqual([{ id: fixture.guideIds.public }]);
      expect(items.error).toBeNull();
      expect(items.data).toEqual([{ id: fixture.guideItemIds.public }]);
    }
  });

  it("blocks anonymous and authenticated writes", async () => {
    const fixture = getFixture();
    const actors = [
      {
        client: fixture.anon,
        guideId: fixture.guideIds.forgedAnon,
        itemId: fixture.guideItemIds.forgedAnon,
      },
      {
        client: fixture.userA,
        guideId: fixture.guideIds.forgedAuthenticated,
        itemId: fixture.guideItemIds.forgedAuthenticated,
      },
    ];

    for (const actor of actors) {
      await actor.client.from("guides").insert({
        id: actor.guideId,
        slug: `forged-${actor.guideId}`,
        title: "Forged guide",
        city: "Prague",
        country_code: "CZ",
        is_public: true,
      });
      await actor.client
        .from("guides")
        .update({ title: "Changed guide" })
        .eq("id", fixture.guideIds.public);
      await actor.client
        .from("guides")
        .delete()
        .eq("id", fixture.guideIds.public);

      await actor.client.from("guide_items").insert({
        id: actor.itemId,
        guide_id: fixture.guideIds.public,
        position: 1,
        title: "Forged item",
      });
      await actor.client
        .from("guide_items")
        .update({ title: "Changed item" })
        .eq("id", fixture.guideItemIds.public);
      await actor.client
        .from("guide_items")
        .delete()
        .eq("id", fixture.guideItemIds.public);

      expect(await adminRow(fixture, "guides", "id", actor.guideId)).toBeNull();
      expect(
        await adminRow(fixture, "guide_items", "id", actor.itemId),
      ).toBeNull();
    }

    expect(
      await adminRow(fixture, "guides", "id", fixture.guideIds.public),
    ).toMatchObject({ title: `Security public guide ${fixture.runId}` });
    expect(
      await adminRow(fixture, "guide_items", "id", fixture.guideItemIds.public),
    ).toMatchObject({ title: `Security public item ${fixture.runId}` });
  });
});
