import { test, expect } from "./fixtures.js";

test.describe("Customer Order Flow", () => {
  test("Customer can place a COD order (existing address)", async ({
    page,
    request,
  }) => {
    const email = `order_${Date.now()}@test.com`;
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page
      .getByRole("textbox", { name: "Full name" })
      .fill("Order Test User");
    await page.getByRole("textbox", { name: "Email address" }).fill(email);
    await page
      .getByRole("textbox", { name: "Phone number" })
      .fill("9876543210");
    await page.getByRole("textbox", { name: /password/i }).fill("password123");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).not.toHaveURL(/\/register/, { timeout: 15000 });

    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeTruthy();

    const apiResponse = await request.post(
      "http://localhost:5000/api/addresses",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          label: "Home",
          line1: "123 Test Street",
          line2: "Near Park",
          city: "Bangalore",
          pincode: "560001",
          isDefault: true,
        },
      },
    );
    expect(apiResponse.ok()).toBeTruthy();

    // ✅ FIX: Navigate, then wait for the restaurant grid to actually appear
    await page.goto("/restaurants", { waitUntil: "domcontentloaded" });

    // Wait for at least one restaurant card to be visible before clicking
    const restaurantSelector = '.restaurant-card, a[href*="/restaurants/"]';
    await expect(page.locator(restaurantSelector).first()).toBeVisible({
      timeout: 20000,
    });

    await page.locator(restaurantSelector).first().click();
    await page.waitForLoadState("networkidle");

    // Wait for the menu page to load (ADD button visible)
    await expect(
      page
        .locator('button, a, div[role="button"]')
        .filter({ hasText: /\b(Add|ADD|\+)\b/ })
        .first(),
    ).toBeVisible({ timeout: 15000 });

    await page
      .locator('button, a, div[role="button"]')
      .filter({ hasText: /\b(Add|ADD|\+)\b/ })
      .first()
      .click({ timeout: 10000 });

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("123 Test Street")).toBeVisible({
      timeout: 10000,
    });

    const phoneInput = page.getByRole("textbox", {
      name: /10-digit mobile number/i,
    });
    if ((await phoneInput.inputValue()) !== "9876543210") {
      await phoneInput.fill("9876543210");
    }

    const codRadio = page.getByRole("radio", { name: /Cash on Delivery/i });
    if (!(await codRadio.isChecked())) {
      await codRadio.check();
    }

    await page
      .getByRole("button", { name: /Place Order|Pay/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/orders\/[a-f0-9]+/, { timeout: 20000 });
  });

  test("Customer can add a NEW address during checkout", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.getByRole("textbox", { name: "Full name" }).fill("Modal Tester");
    await page
      .getByRole("textbox", { name: "Email address" })
      .fill(`modal_${Date.now()}@test.com`);
    await page
      .getByRole("textbox", { name: "Phone number" })
      .fill("9876543210");
    await page.getByRole("textbox", { name: /password/i }).fill("password123");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).not.toHaveURL(/\/register/, { timeout: 15000 });

    await page.goto("/restaurants", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator('.restaurant-card, a[href*="/restaurants/"]').first(),
    ).toBeVisible({ timeout: 20000 });
    await page
      .locator('.restaurant-card, a[href*="/restaurants/"]')
      .first()
      .click();
    await page.waitForLoadState("networkidle");

    await page
      .locator('button, a, div[role="button"]')
      .filter({ hasText: /\b(Add|ADD|\+)\b/ })
      .first()
      .click({ timeout: 10000 });

    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /Add New/i }).click();
    await page.getByLabel("Address Line 1 *").fill("456 Test Avenue");
    await page.getByLabel("Address Line 2 (Optional)").fill("Ground Floor");
    await page.getByLabel("City *").fill("Mumbai");
    await page.getByLabel("Pincode *").fill("400001");
    await page.getByRole("button", { name: /Save Address/i }).click();

    await expect(page.getByText("456 Test Avenue")).toBeVisible({
      timeout: 5000,
    });
  });
});
