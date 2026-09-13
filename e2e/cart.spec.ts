import { test, expect } from "@playwright/test";
import { registerNewUser, firstProductHref } from "./helpers/auth";

test.describe("ตะกร้าสินค้า", () => {
  // แต่ละเทสต์สมัคร user ใหม่เพื่อไม่ให้ตะกร้าชนกัน (รัน parallel ได้)
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
  });

  test("เพิ่มสินค้าลงตะกร้าแล้วเห็น badge อัปเดต", async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);
    await page.getByRole("button", { name: /เพิ่มลงตะกร้า/ }).click();
    await expect(page.getByLabel("ตะกร้าสินค้า").getByText(/\d+/)).toBeVisible();
  });

  test("หน้า /cart แสดงสินค้าที่เพิ่ม และเปลี่ยนจำนวนได้", async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);
    await page.getByRole("button", { name: /เพิ่มลงตะกร้า/ }).click();
    await expect(page.getByLabel("ตะกร้าสินค้า").getByText(/\d+/)).toBeVisible();

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "ตะกร้าสินค้า", exact: true })).toBeVisible();
    await expect(
      page.locator("a[href^='/product/']", { has: page.locator("img") }).first()
    ).toBeVisible();

    const qty = page
      .getByRole("button", { name: "เพิ่มจำนวน" })
      .first()
      .locator("xpath=preceding-sibling::span[1]");
    const before = parseInt((await qty.textContent()) ?? "1", 10);
    await page.getByRole("button", { name: "เพิ่มจำนวน" }).first().click();
    await expect
      .poll(async () => parseInt((await qty.textContent()) ?? "0", 10))
      .toBeGreaterThan(before);
  });

  test("ลบสินค้าออกจากตะกร้าได้", async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);
    await page.getByRole("button", { name: /เพิ่มลงตะกร้า/ }).click();
    await expect(page.getByLabel("ตะกร้าสินค้า").getByText(/\d+/)).toBeVisible();

    await page.goto("/cart");
    await page.getByRole("button", { name: "ลบสินค้า" }).first().click();
    await expect(page.getByText(/ตะกร้าว่างเปล่า/)).toBeVisible({ timeout: 10_000 });
  });
});
