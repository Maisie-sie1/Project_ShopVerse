import { test, expect } from "@playwright/test";
import { registerNewUser, addFirstProductToCart } from "./helpers/auth";

test.describe("TS-04: Checkout", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page); // user ใหม่ทุกครั้ง
  });

  test("TC CHK-001: สั่งซื้อแบบเก็บเงินปลายทางสำเร็จ → order detail", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "ชำระเงิน", exact: true })).toBeVisible();

    // กรอกที่อยู่ครบ
    await page.getByLabel("ชื่อผู้รับ *").fill("ผู้ทดสอบ E2E");
    await page.getByLabel("เบอร์โทรศัพท์ *").fill("0812345678");
    await page.getByLabel("ที่อยู่ (บ้านเลขที่ / ถนน) *").fill("12/34 ถ.สุขุมวิท");
    await page.getByLabel("อำเภอ/เขต *").fill("วัฒนา");
    await page.getByLabel("จังหวัด *").fill("กรุงเทพมหานคร");
    await page.getByLabel("รหัสไปรษณีย์ *").fill("10110");

    await page.getByRole("button", { name: /ยืนยันการสั่งซื้อ/ }).click();

    // redirect ไป order detail และเห็นเลข order + วิธีชำระ
    await page.waitForURL(/\/account\/orders\/[a-z0-9]+/i, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /ORD-/ })).toBeVisible();
    await expect(page.getByText(/เก็บเงินปลายทาง/)).toBeVisible();
  });

  test("TC CHK-002: ไม่กรอกที่อยู่ → validation (ยังอยู่ /checkout)", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "ชำระเงิน", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /ยืนยันการสั่งซื้อ/ }).click();
    // browser required validation กัน submit → URL ไม่เปลี่ยน
    await expect(page).toHaveURL(/\/checkout/);
  });
});
