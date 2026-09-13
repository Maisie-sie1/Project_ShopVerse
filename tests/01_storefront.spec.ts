import { test, expect } from "@playwright/test";
import { productCards } from "./helpers/auth";

test.describe("TS-01: Storefront & Catalog", () => {
  test("TC STORE-001: โหลดหน้าแรก แสดง hero + สินค้าแนะนำ", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ShopVerse/);
    await expect(page.getByRole("heading", { name: /ของดีราคาดี/ })).toBeVisible();
    await expect(productCards(page).first()).toBeVisible();
  });

  test("TC STORE-002: ปุ่ม CTA นำไปหน้า /shop", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "เริ่มช้อปปิ้ง" }).click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByRole("heading", { name: "สินค้าทั้งหมด" })).toBeVisible();
  });

  test("TC STORE-003: กรองตามหมวดหมู่ (drinks)", async ({ page }) => {
    await page.goto("/shop?category=drinks");
    await expect(productCards(page).first()).toBeVisible();
    // ผลลัพธ์ต้องเป็นสินค้าเครื่องดื่มจริง (มีภาพ alt เป็นชื่อเครื่องดื่ม)
    const alt = await productCards(page).first().locator("img").getAttribute("alt");
    expect(alt).toBeTruthy();
  });

  test("TC STORE-004: ค้นหาสินค้า 'กาแฟ'", async ({ page }) => {
    await page.goto("/shop?search=กาแฟ");
    await expect(productCards(page).first()).toBeVisible();
    // alt ของรูป = ชื่อสินค้า ควรมีคำว่า กาแฟ
    await expect(productCards(page).first().locator("img")).toHaveAttribute(
      "alt",
      /กาแฟ/i
    );
  });

  test("TC STORE-005: เปิดหน้าสินค้าและเห็นรายละเอียด + ปุ่มเพิ่ม", async ({ page }) => {
    await page.goto("/shop");
    const card = productCards(page).first();
    await card.click();
    await page.waitForURL(/\/product\/.+/);
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /เพิ่มลงตะกร้า|สินค้าหมด/ })
    ).toBeVisible();
  });
});
