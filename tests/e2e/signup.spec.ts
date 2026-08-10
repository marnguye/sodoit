import { expect, test } from "@playwright/test";

test.describe("signup", () => {
  test("renders signup page", async ({ page }) => {
    await page.goto("/signup");

    await expect(
      page.getByRole("heading", {
        name: "Create your account",
      }),
    ).toBeVisible();

    await expect(page.getByLabel("Your name", { exact: true })).toBeVisible();

    await expect(page.getByLabel("Username", { exact: true })).toBeVisible();

    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();

    await expect(page.locator("#password")).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Create account",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("rejects invalid username before sending request", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel("Your name", { exact: true }).fill("Test User");

    await page.getByLabel("Username", { exact: true }).fill("ab");

    await page.getByLabel("Email", { exact: true }).fill("test@example.com");

    await page.locator("#password").fill("strong-password");

    await page
      .getByRole("button", {
        name: "Create account",
        exact: true,
      })
      .click();

    await expect(
      page.getByText(
        "Username must be 3-24 lowercase letters, numbers, underscores, or dashes.",
        { exact: true },
      ),
    ).toBeVisible();
  });

  test("shows safe error when signup fails", async ({ page }) => {
    let signupRequestIntercepted = false;

    await page.route("**/rest/v1/profiles**", async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await page.route(/\/auth\/v1\/signup(?:\?.*)?$/, async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      signupRequestIntercepted = true;

      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          code: "signup_failed",
          message: "Signup failed",
        }),
      });
    });

    await page.goto("/signup");

    await page.getByLabel("Your name", { exact: true }).fill("Test User");

    await page.getByLabel("Username", { exact: true }).fill("e2e_signup_test");

    await page.getByLabel("Email", { exact: true }).fill("signup@example.com");

    await page.locator("#password").fill("strong-password");

    await page
      .getByRole("button", {
        name: "Create account",
        exact: true,
      })
      .click();

    await expect.poll(() => signupRequestIntercepted).toBe(true);

    await expect(page.locator('p[role="alert"]')).toHaveText(
      "Could not create your account. Please check your details and try again.",
    );
  });

  test("login link preserves next path", async ({ page }) => {
    await page.goto("/signup?next=%2Fsettings%2Fprofile");

    await expect(
      page.getByRole("link", {
        name: "Log in",
        exact: true,
      }),
    ).toHaveAttribute("href", "/login?next=%2Fsettings%2Fprofile");
  });
});
