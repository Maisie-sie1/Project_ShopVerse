import { test, expect } from "@playwright/test";
import { registerNewUser, addFirstProductToCart } from "./helpers/auth";

test.describe("TS-03: Cart", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page); // user ใหม่ทุกครั้ง ไม่ให้ตะกร้าชนกัน
  });

  test("TC CART-001: เพิ่มสินค้าแล้ว badge อัปเดตเป็น ≥ 1", async ({ page }) => {
    await addFirstProductToCart(page);
    await expect(page.getByLabel("ตะกร้าสินค้า").getByText(/\d+/)).toBeVisible();
  });

  test("TC CART-002: หน้า /cart แสดงสินค้าและเปลี่ยนจำนวนได้", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "ตะกร้าสินค้า", exact: true })).toBeVisible();

    // มีรายการสินค้า (link ไปหน้า product)
    const item = page.locator("a[href^='/product/']", { has: page.locator("img") }).first();
    await expect(item).toBeVisible();

    // จับตัวเลขจำนวนก่อน/หลังกด +
    const qty = page
      .getByRole("button", { name: "เพิ่มจำนวน" })
      .first()
      .locator("xpath=preceding-sibling::span[1]");
    const before = parseInt((await qty.textContent()) ?? "1", 10);
    await page.getByRole("button", { name: "เพิ่มจำนวน" }).first().click();
    await expect
      .poll(async () => parseInt((await qty.textContent()) ?? "0", 10), {
        timeout: 15_000,
      })
      .toBeGreaterThan(before);
  });

  test("TC CART-003: ลบสินค้าออกจากตะกร้า → ว่าง", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/cart");
    await page.getByRole("button", { name: "ลบสินค้า" }).first().click();
    await expect(page.getByText(/ตะกร้าว่างเปล่า/)).toBeVisible({ timeout: 15_000 });
  });
});
