import { expect, test as setup } from "@playwright/test";
import path from "node:path";

const authFile = path.join(process.cwd(), "playwright/.auth/user.json");

setup("authenticate test user", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error("E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be configured.");
  }

  await page.goto("/login?next=%2Fsettings%2Fprofile");

  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.locator("#password").fill(password);

  const loginButton = page.getByRole("button", {
    name: "Log in",
    exact: true,
  });

  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  await expect(page).toHaveURL(/\/settings\/profile$/);

  await page.context().storageState({
    path: authFile,
  });
});
