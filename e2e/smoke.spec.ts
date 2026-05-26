// Smoke E2E: confirms the app boots and the Dex family ladder renders.
// The family ladder is server-rendered from the achievement library via
// buildDexLadder + buildDexSampleResults, so this also guards that pipeline.
//
// Two stability measures, both standard E2E hygiene rather than app changes:
//  1. The layout mounts a marquee that fetches /api/live-news, which proxies
//     external Google News. That request is slow or blocked in CI and would
//     leave the page busy through context teardown, so we abort it. The
//     marquee already falls back to curated headlines when the feed is gone.
//  2. Navigation uses waitUntil "domcontentloaded" because looping holo
//     animations keep the full "load" event from settling promptly.

import { expect, test } from "@playwright/test";

const READY = { waitUntil: "domcontentloaded" } as const;

test.beforeEach(async ({ page }) => {
  // Block the live-news proxy so no external request is left in flight.
  await page.route("**/api/live-news**", (route) => route.abort());
});

test("home page loads", async ({ page }) => {
  await page.goto("/", READY);
  await expect(page).toHaveTitle(/Cracked/i);
  await expect(page.getByRole("link", { name: /dex/i }).first()).toBeVisible();
});

test("dex index lists the nine families", async ({ page }) => {
  await page.goto("/dex", READY);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FAMILIES");
  // Nine family tiles, each linking to a family ladder.
  const familyLinks = page.locator('a[href^="/dex/family/"]');
  await expect(familyLinks).toHaveCount(9);
});

test("engineering family ladder renders", async ({ page }) => {
  await page.goto("/dex/family/engineering", READY);
  // generateMetadata sets "<name> - Cracked Dex".
  await expect(page).toHaveTitle(/Engineering/i);
  // Visible hero heading is the family name, upper-cased.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ENGINEERING");
  // The ladder section header is always rendered above the tiers.
  await expect(page.getByText("THE LADDER · TOP TO BOTTOM")).toBeVisible();
});

test("unknown family slug returns a not-found response", async ({ page }) => {
  const response = await page.goto("/dex/family/this-family-does-not-exist", READY);
  expect(response?.status()).toBe(404);
});
