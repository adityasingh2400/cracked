// Playwright config — E2E tests for cracked.com v1.0.
// Covers: PDF upload flow, bookmarklet handoff, og:image preview render,
// share flow, dex browse, leaderboard browse, Chrome extension contract.

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
  ],
  webServer: {
    // In CI we serve the production build the workflow already produced.
    // `next dev` keeps an HMR socket open and compiles routes on first hit,
    // which stalls context teardown under parallel load. `next start` has
    // neither, so the suite is stable. Locally we keep `next dev` for speed.
    command: process.env.CI ? "bun run start" : "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
