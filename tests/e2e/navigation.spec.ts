import { expect, test } from "@playwright/test";

test.describe("main navigation", () => {
  test("navigates between Browse, Guides, and Feed", async ({ page }) => {
    await page.goto("/");

    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });

    const browseLink = navigation.getByRole("link", {
      name: "Browse",
      exact: true,
    });

    const feedLink = navigation.getByRole("link", {
      name: "Feed",
      exact: true,
    });

    const guidesLink = navigation.getByRole("link", {
      name: "Guides",
      exact: true,
    });

    await expect(browseLink).toHaveAttribute("aria-current", "page");

    await guidesLink.click();

    await expect(page).toHaveURL(/\/guides$/);
    await expect(
      page.getByRole("heading", { name: "Guides", level: 1 }),
    ).toBeVisible();
    await expect(guidesLink).toHaveAttribute("aria-current", "page");

    await feedLink.click();

    await expect(page).toHaveURL(/\/feed$/);
    await expect(feedLink).toHaveAttribute("aria-current", "page");

    await browseLink.click();

    await expect(page).toHaveURL(/\/$/);
    await expect(browseLink).toHaveAttribute("aria-current", "page");
  });

  test("direct feed navigation works", async ({ page }) => {
    await page.goto("/feed");

    await expect(page).toHaveURL(/\/feed$/);

    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });

    await expect(
      navigation.getByRole("link", {
        name: "Feed",
        exact: true,
      }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("missing Guide uses the not-found page", async ({ page }) => {
    await page.goto("/guides/this-guide-does-not-exist");

    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
  });
});
