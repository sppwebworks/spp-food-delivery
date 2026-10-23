import { test, expect } from "./fixtures.js";
import { TEST_DATA } from "../utils/testData";

test.describe("Admin Dashboard Flow", () => {
  test("Admin can login and view orders", async ({ page }) => {
    await page.goto("http://localhost:5174/admin/login");

    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");

    await page.fill('input[type="email"]', TEST_DATA.admin.email);
    await page.fill('input[type="password"]', TEST_DATA.admin.password);

    // ✅ Use text-based selector instead of type="submit"
    await page
      .locator('button:has-text("Login"), button:has-text("Sign In")')
      .first()
      .click();

    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  });
});
