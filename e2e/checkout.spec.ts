import { test, expect } from "@playwright/test";
import { registerNewUser, firstProductHref } from "./helpers/auth";

test.describe("ชำระเงิน (Checkout)", () => {
  // แต่ละเทสต์สมัคร user ใหม่ เพื่อไม่ให้ชนกับเทสต์อื่น (parallel-safe)
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
  });

  test("สั่งซื้อสินค้าแบบเก็บเงินปลายทางสำเร็จ", async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);
    await page.getByRole("button", { name: /เพิ่มลงตะกร้า/ }).click();
    await expect(page.getByLabel("ตะกร้าสินค้า").getByText(/\d+/)).toBeVisible();

    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "ชำระเงิน", exact: true })).toBeVisible();

    // กรอกฟอร์มที่อยู่
    await page.getByLabel("ชื่อผู้รับ *").fill("ผู้ทดสอบ E2E");
    await page.getByLabel("เบอร์โทรศัพท์ *").fill("0812345678");
    await page.getByLabel("ที่อยู่ (บ้านเลขที่ / ถนน) *").fill("12/34 ถ.สุขุมวิท");
    await page.getByLabel("อำเภอ/เขต *").fill("วัฒนา");
    await page.getByLabel("จังหวัด *").fill("กรุงเทพมหานคร");
    await page.getByLabel("รหัสไปรษณีย์ *").fill("10110");

    await page.getByRole("button", { name: /ยืนยันการสั่งซื้อ/ }).click();

    // redirect ไปหน้า order detail
    await page.waitForURL(/\/account\/orders\/[a-z0-9]+/i, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /ORD-/ })).toBeVisible();
    await expect(page.getByText(/เก็บเงินปลายทาง/)).toBeVisible();
  });

  test("checkout โดยไม่กรอกที่อยู่แสดง validation error", async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);
    await page.getByRole("button", { name: /เพิ่มลงตะกร้า/ }).click();
    await expect(page.getByLabel("ตะกร้าสินค้า").getByText(/\d+/)).toBeVisible();

    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "ชำระเงิน", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /ยืนยันการสั่งซื้อ/ }).click();
    // browser required validation -> ยังอยู่ที่ /checkout
    await expect(page).toHaveURL(/\/checkout/);
  });
});
