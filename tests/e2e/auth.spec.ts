import { expect, test } from "@playwright/test";

test.describe("authentication", () => {
  test("renders login page", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();

    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();

    await expect(page.locator("#password")).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Log in",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("shows safe error for invalid credentials", async ({ page }) => {
    await page.route("**/auth/v1/**", async (route) => {
      const request = route.request();

      if (request.method() === "POST" && request.url().includes("/token")) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            code: "invalid_credentials",
            message: "Invalid login credentials",
          }),
        });

        return;
      }

      await route.continue();
    });

    await page.goto("/login");

    await page
      .getByLabel("Email", { exact: true })
      .fill("invalid-user@example.com");

    await page.locator("#password").fill("definitely-not-the-password");

    await page
      .getByRole("button", {
        name: "Log in",
        exact: true,
      })
      .click();

    await expect(page.locator('p[role="alert"]')).toHaveText(
      "Incorrect email or password.",
    );

    await expect(
      page.getByRole("button", {
        name: "Log in",
        exact: true,
      }),
    ).toBeEnabled();

    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });

  test("redirects protected route to login and preserves next path", async ({
    page,
  }) => {
    await page.goto("/settings/profile");

    await expect(page).toHaveURL(/\/login\?next=%2Fsettings%2Fprofile$/);
  });

  test("redirects My List to login for guests", async ({ page }) => {
    await page.goto("/list");

    await expect(page).toHaveURL(/\/login\?next=%2Flist$/);
  });

  test("guest header does not show My List", async ({ page }) => {
    await page.goto("/");

    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });

    await expect(
      navigation.getByRole("link", { name: "My List" }),
    ).not.toBeVisible();
  });

  test("preserves protected route query string", async ({ page }) => {
    await page.goto("/feed/new?experience=test");

    await expect(page).toHaveURL(
      /\/login\?next=%2Ffeed%2Fnew%3Fexperience%3Dtest$/,
    );
  });

  test("login links to signup while preserving next", async ({ page }) => {
    await page.goto("/login?next=%2Ffeed%2Fnew");

    await expect(
      page.getByRole("link", {
        name: "Create account",
      }),
    ).toHaveAttribute("href", "/signup?next=%2Ffeed%2Fnew");
  });
});
