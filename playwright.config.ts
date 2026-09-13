import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E + API config — ShopVerse
 *
 * - project "chromium": E2E UI tests (browser)
 * - project "api": REST API tests ใช้ request context (เร็ว ไม่ต้อง browser)
 *
 * webServer: เปิด Next.js ให้อัตโนมัติ (reuse ถ้ามี server อยู่แล้ว)
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      testIgnore: /tests\/api\//,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      testIgnore: /tests\/api\//,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "api",
      testMatch: /tests\/api\/.*\.spec\.ts/,
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
