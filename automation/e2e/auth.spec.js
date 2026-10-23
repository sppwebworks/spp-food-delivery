import { test, expect } from "./fixtures.js";
import { TEST_DATA } from "../utils/testData";

test.describe("Authentication Flow", () => {
  test("Customer can register successfully", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // ✅ Fill by accessible label (matches the DOM snapshot)
    await page
      .getByRole("textbox", { name: "Full name" })
      .fill(TEST_DATA.customer.name);
    await page
      .getByRole("textbox", { name: "Email address" })
      .fill(TEST_DATA.customer.email);
    await page
      .getByRole("textbox", { name: "Phone number" })
      .fill(TEST_DATA.customer.phone);
    await page
      .getByRole("textbox", { name: /password/i })
      .fill(TEST_DATA.customer.password);

    // ✅ Use the actual button label Playwright found
    await page.getByRole("button", { name: "Create Account" }).click();

    // Wait for navigation away from /register
    await expect(page).not.toHaveURL(/\/register/, { timeout: 15000 });
  });
});
