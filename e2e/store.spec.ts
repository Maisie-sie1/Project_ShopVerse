import { test, expect } from "@playwright/test";

/**
 * Locator ที่เจาะจงเฉพาะการ์ดสินค้า: ลิงก์ไป /product/... ที่มีรูป (img)
 * ไม่รวมลิงก์หมวดหมู่/ลิงก์อื่นๆ ใน sidebar
 */
function productCards(page: import("@playwright/test").Page) {
  return page.locator("a[href^='/product/']", { has: page.locator("img") });
}

test.describe("หน้าแรก", () => {
  test("โหลดหน้าแรกและแสดง hero + สินค้าแนะนำ", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ShopVerse/);
    await expect(page.getByRole("heading", { name: /ของดีราคาดี/ })).toBeVisible();
    // สินค้าแนะนำมีอย่างน้อย 1 ใบ
    await expect(productCards(page).first()).toBeVisible();
  });

  test("นำทางไปหน้าสินค้าทั้งหมดจากปุ่ม CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "เริ่มช้อปปิ้ง" }).click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByRole("heading", { name: "สินค้าทั้งหมด" })).toBeVisible();
  });
});

test.describe("หน้ารวมสินค้า /shop", () => {
  test("แสดงสินค้าและกรองตามหมวดหมู่", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: "สินค้าทั้งหมด" })).toBeVisible();
    await expect(productCards(page).first()).toBeVisible();

    await page.goto("/shop?category=drinks");
    await expect(productCards(page).first()).toBeVisible();
  });

  test("ค้นหาสินค้าได้", async ({ page }) => {
    await page.goto("/shop?search=กาแฟ");
    await expect(productCards(page).first()).toBeVisible();
    // รูปที่ค้นหามี alt เป็นชื่อสินค้าที่มีคำว่า กาแฟ
    await expect(page.locator("a[href^='/product/'] img").first()).toHaveAttribute(
      "alt",
      /กาแฟ/i
    );
  });
});

test.describe("หน้าสินค้า", () => {
  test("เปิดสินค้าจากหน้า shop และเห็นรายละเอียด", async ({ page }) => {
    await page.goto("/shop");
    const first = productCards(page).first();
    await first.click();
    await page.waitForURL(/\/product\/.+/);
    await expect(page.locator("h1")).toBeVisible();
    // มีปุ่มเพิ่มลงตะกร้า (แม้ยังไม่ login กดแล้ว redirect)
    await expect(page.getByRole("button", { name: /เพิ่มลงตะกร้า|สินค้าหมด/ })).toBeVisible();
  });
});
