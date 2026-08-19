import { expect, test } from "@playwright/test";

test.describe("browse editorial redesign", () => {
  test("default state renders the editorial heading and no onboarding sidebar", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Things worth doing." }),
    ).toBeVisible();

    await expect(page.getByText("How Sodoit works")).toHaveCount(0);
    await expect(page.getByText("Start your life list")).toHaveCount(0);
  });

  test("featured experience, when present, links to a real experience", async ({
    page,
  }) => {
    await page.goto("/");

    const featuredBadge = page.getByText("Featured", { exact: true });

    if ((await featuredBadge.count()) === 0) {
      test.skip();
      return;
    }

    const featureLink = page
      .locator("section", { has: featuredBadge })
      .getByRole("link")
      .first();

    await expect(featureLink).toHaveAttribute("href", /^\/tasks\/[^/]+$/);

    const accessibleName = await featureLink.getAttribute("aria-label");
    expect(accessibleName?.length ?? 0).toBeGreaterThan(0);
  });

  test("search updates the URL and results", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("searchbox").fill("a");
    await expect(page).toHaveURL(/[?&]q=a/, { timeout: 5000 });
  });

  test("category filter updates the URL and suppresses the editorial hero", async ({
    page,
  }) => {
    await page.goto("/");

    const categoryGroup = page.getByRole("group", { name: "Categories" });
    await categoryGroup.getByRole("button", { name: "Adventure" }).click();

    await expect(page).toHaveURL(/[?&]category=Adventure/);
    await expect(page.getByText("Featured", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/result/)).toBeVisible();
  });

  test("clearing filters returns to the default editorial view", async ({
    page,
  }) => {
    await page.goto("/?category=Adventure");

    await page.getByRole("button", { name: "Clear filters" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Things worth doing." }),
    ).toBeVisible();
  });

  test("grid/list view toggle preserves URL state", async ({ page }) => {
    await page.goto("/?category=Adventure");

    await page.getByRole("button", { name: "List view" }).click();

    await expect(page).toHaveURL(/[?&]view=list/);
    await expect(page).toHaveURL(/[?&]category=Adventure/);
  });

  test("marking an experience complete toggles its state", async ({ page }) => {
    await page.goto("/?category=Adventure&view=list");

    const firstToggle = page.getByRole("checkbox").first();
    await expect(firstToggle).toBeVisible();

    const wasChecked =
      (await firstToggle.getAttribute("aria-checked")) === "true";

    await firstToggle.click();

    await expect(firstToggle).toHaveAttribute(
      "aria-checked",
      wasChecked ? "false" : "true",
    );

    await firstToggle.click();
    await expect(firstToggle).toHaveAttribute(
      "aria-checked",
      wasChecked ? "true" : "false",
    );
  });

  test("empty results show correct empty state", async ({ page }) => {
    await page.goto("/?q=zzzznonexistentzzz");

    await expect(page.getByText("Nothing matches")).toBeVisible();
  });
});
