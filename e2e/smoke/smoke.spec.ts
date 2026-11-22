/**
 * Smoke tests: sign in, the main pages render without an error state, sign out (issue 0034).
 * Selectors are roles and labels, never styling classes. The signed-in steps are skipped when
 * SMOKE_USER and SMOKE_PASSWORD aren't set.
 */
import { expect, type Page, test } from "@playwright/test";

const user = process.env.SMOKE_USER;
const password = process.env.SMOKE_PASSWORD;

// Shown by the app's error boundaries and failed queries.
const ERROR_STATE = /something went wrong|failed to load|unexpected error/i;
// The password input is named by its placeholder ("Enter your password") today: its "Password"
// label isn't associated with it. This matches either.
const PASSWORD = { name: /password/i } as const;

async function expectNoErrorState(page: Page) {
  await expect(page.getByText(ERROR_STATE)).toHaveCount(0);
}

test("the sign-in page renders", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByLabel("Email or MuID")).toBeVisible();
  await expect(page.getByRole("textbox", PASSWORD)).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test.describe("signed in", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(
    !user || !password,
    "Set SMOKE_USER and SMOKE_PASSWORD to run the signed-in steps.",
  );

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test("signs in", async () => {
    await page.goto("/login");
    await page.getByLabel("Email or MuID").fill(user ?? "");
    await page.getByRole("textbox", PASSWORD).fill(password ?? "");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("the dashboard home renders", async () => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("button", { name: "Account menu" }),
    ).toBeVisible();
    await expectNoErrorState(page);
  });

  for (const [name, path] of [
    ["events", "/dashboard/events"],
    ["learning circles", "/dashboard/learning-circle"],
    ["interest groups", "/dashboard/interest-groups"],
    ["the profile", "/dashboard/profile"],
  ] as const) {
    test(`${name} renders without an error state`, async () => {
      const response = await page.goto(path);

      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByRole("main")).toBeVisible();
      await expectNoErrorState(page);
    });
  }

  test("signs out", async () => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await page.getByRole("button", { name: "Logout" }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
