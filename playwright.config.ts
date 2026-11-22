/**
 * The staging smoke suite (e2e/smoke, issue 0034). Maintainer-run, against staging only, and not
 * in CI. SMOKE_BASE_URL is required; SMOKE_USER and SMOKE_PASSWORD come from the environment,
 * never from a committed file. See CONTRIBUTING.md.
 */
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.SMOKE_BASE_URL;
// --list only reads the tests, so it doesn't need an environment.
if (!baseURL && !process.argv.includes("--list")) {
  throw new Error(
    "Set SMOKE_BASE_URL to the site under test, for example SMOKE_BASE_URL=https://staging.app.mulearn.org bun run smoke.",
  );
}

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
