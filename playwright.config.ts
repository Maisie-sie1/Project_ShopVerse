import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config — ShopVerse
 *
 * webServer: เปิด Next.js ให้อัตโนมัติ (reuse ถ้ามี server อยู่แล้ว)
 * แต่ละเทสต์ใช้ user ใหม่ (register ผ่าน UI) เพื่อไม่ให้ data ชนกัน
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // รัน test ในไฟล์เดียวกันเป็น parallel แต่ไฟล์ต่อไฟล์ (ลด load DB)
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
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } }, // ตรวจ cross-browser (cookie/Safari)
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
