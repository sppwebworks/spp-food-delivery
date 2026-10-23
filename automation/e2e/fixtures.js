import { test as base, expect } from "@playwright/test";

// Custom test that clears browser storage before each test
export const test = base.extend({
  page: async ({ page }, use) => {
    // Clear storage on first load
    await page.goto("/", { waitUntil: "domcontentloaded" }).catch(() => {});
    await page.context().clearCookies();
    await page
      .evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      })
      .catch(() => {});

    await use(page);
  },
});

export { expect };
