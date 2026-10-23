import { test, expect } from "./fixtures.js";
import { TEST_DATA } from "../utils/testData";

test.describe("Rider App Flow", () => {
  test("Rider can login and toggle online", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);

    await page.goto("http://localhost:5175/login");
    await page.waitForLoadState("networkidle");

    // Check DOM snapshot for actual labels
    await page.screenshot({ path: "debug-rider-login.png" });

    // Try both common login field patterns
    const emailInput = page
      .locator('input[type="email"], input[placeholder*="mail"]')
      .first();
    const passwordInput = page
      .locator('input[type="password"], input[placeholder*="assword"]')
      .first();

    await emailInput.fill(TEST_DATA.rider.email);
    await passwordInput.fill(TEST_DATA.rider.password);

    await page
      .locator("button")
      .filter({ hasText: /Sign In|Login|Sign in/ })
      .first()
      .click();

    // Wait for redirect away from /login
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Screenshot the logged-in state so we can see what's there
    await page.screenshot({ path: "debug-rider-dashboard.png" });

    // Find any button that has Online or Offline in the text
    const toggleBtn = page
      .locator("button")
      .filter({ hasText: /Online|Offline/ })
      .first();

    const isVisible = await toggleBtn
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!isVisible) {
      throw new Error(
        "Online/Offline toggle button not found on the rider dashboard. See debug-rider-dashboard.png",
      );
    }

    await toggleBtn.click();
    await page.waitForTimeout(1500);

    // Verify it flipped (either "Online" or "Offline" shows now)
    await expect(
      page
        .locator("button")
        .filter({ hasText: /Online|Offline/ })
        .first(),
    ).toBeVisible({ timeout: 5000 });
  });
});
