import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — automated E2E tests for ShopVerse.
 *
 * `webServer` ทำให้ Playwright เปิด Next.js app ให้เอง (กดปิดอัตโนมัติเมื่อจบ)
 * ดังนั้นไม่ต้องรัน `npm run dev` แยก
 */
export default defineConfig({
  testDir: "./e2e",
  // รันเทสต์ในไฟล์เดียวกันแบบ parallel แต่ละไฟล์รันตามลำดับ
  // (ลด load ต่อ DB บน Neon เมื่อรัน E2E)
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 2,
  workers: process.env.CI ? 1 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,

  // รอ element นานขึ้น (API ผ่าน Neon มี latency)
  expect: { timeout: 15_000 },

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
