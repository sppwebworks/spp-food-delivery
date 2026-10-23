import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // ✅ Disable parallel test files
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // ✅ Run 1 test at a time (prevents browser crashes)
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Give each test more time to run on slower machines
  timeout: 60000,

  webServer: [
    {
      command: "cd ../server && npm run dev",
      url: "http://localhost:5000/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "cd ../client && npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "cd ../admin && npm run dev",
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
