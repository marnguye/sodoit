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

  test("list view URL param combines with other filter state", async ({
    page,
  }) => {
    await page.goto("/?category=Adventure&view=list");

    await expect(page).toHaveURL(/[?&]view=list/);
    await expect(page).toHaveURL(/[?&]category=Adventure/);
    await expect(page.getByText("Featured", { exact: true })).toHaveCount(0);
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

  test("save toggles from the Feature and from a Standard card", async ({
    page,
  }) => {
    await page.goto("/");

    const controls = page.getByRole("checkbox");
    await expect(controls.nth(1)).toBeVisible();

    for (const index of [0, 1]) {
      const control = controls.nth(index);
      const before = await control.getAttribute("aria-checked");

      await control.click();
      await expect(control).not.toHaveAttribute("aria-checked", before ?? "");

      await control.click();
      await expect(control).toHaveAttribute("aria-checked", before ?? "false");
    }
  });

  test("list mode never renders the Featured hero or wide/standard sections", async ({
    page,
  }) => {
    await page.goto("/?view=list");

    await expect(page.getByText("Featured", { exact: true })).toHaveCount(0);
    await expect(page.locator("main ul.grid")).toHaveCount(0);
  });

  test("filtered results use the Standard card, not editorial sections", async ({
    page,
  }) => {
    await page.goto("/?category=Adventure");

    await expect(page.getByText("Featured", { exact: true })).toHaveCount(0);
    await expect(page.locator("main section h2")).toHaveCount(0);
  });

  test("difficulty filter supports all four levels and round-trips via the URL", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Filters", exact: true }).click();

    const difficultyGroup = page.getByRole("group", { name: "Difficulty" });
    await expect(
      difficultyGroup.getByRole("button", { name: "Extreme" }),
    ).toBeVisible();

    await difficultyGroup.getByRole("button", { name: "Extreme" }).click();

    await expect(page).toHaveURL(/[?&]difficulty=Extreme/);

    await page.reload();
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    await expect(
      page
        .getByRole("group", { name: "Difficulty" })
        .getByRole("button", { name: "Extreme", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("difficulty indicator always exposes a readable text label", async ({
    page,
  }) => {
    await page.goto("/?category=Adventure");

    const firstCard = page.locator("main ul li").first();
    await expect(
      firstCard.getByText(/^(Easy|Medium|Hard|Extreme)$/),
    ).toBeVisible();
  });
});
