import { expect, test } from "@playwright/test";

test.describe("main navigation", () => {
  test("navigates between Browse and Feed", async ({ page }) => {
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

    await expect(browseLink).toHaveAttribute("aria-current", "page");

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
});
