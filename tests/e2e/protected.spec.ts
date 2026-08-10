import { expect, test } from "@playwright/test";

test.describe("authenticated protected routes", () => {
  test("authenticated user can access profile settings", async ({ page }) => {
    await page.goto("/settings/profile");

    await expect(page).toHaveURL(/\/settings\/profile$/);

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).not.toBeVisible();
  });

  test("authenticated user can access new post page", async ({ page }) => {
    await page.goto("/feed/new");

    await expect(page).toHaveURL(/\/feed\/new$/);

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).not.toBeVisible();
  });

  test("authenticated user visiting login is redirected to requested page", async ({
    page,
  }) => {
    await page.goto("/login?next=%2Fsettings%2Fprofile");

    await expect(page).toHaveURL(/\/settings\/profile$/);
  });

  test("authenticated redirect preserves protected query string", async ({
    page,
  }) => {
    await page.goto("/login?next=%2Ffeed%2Fnew%3Fexperience%3Dtest");

    await expect(page).toHaveURL(/\/feed\/new\?experience=test$/);
  });
});
