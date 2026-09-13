import { expect, type Page } from "@playwright/test";

/** Seed accounts (จาก prisma/seed.ts) */
export const SEED = {
  admin: { email: "admin@shop.com", password: "admin123" },
  customer: { email: "customer@shop.com", password: "customer123" },
} as const;

/** Register user ใหม่ผ่าน UI → login อัตโนมัติ (เพื่อไม่ให้ data ชนกันเวลา parallel) */
export async function registerNewUser(page: Page, name = "ผู้ทดสอบ E2E"): Promise<string> {
  const email = `e2e_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
  await page.goto("/register");
  await page.getByLabel("ชื่อ-นามสกุล").fill(name);
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill("secret123");
  await page.getByLabel("ยืนยันรหัสผ่าน").fill("secret123");
  await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
  await expect(page.getByLabel("บัญชีผู้ใช้")).toBeVisible({ timeout: 20_000 });
  return email;
}

/** Login ผ่าน UI จริง และรอ session set (ปุ่มบัญชีโผล่) */
export async function login(
  page: Page,
  { email, password }: { email: string; password: string }
) {
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page.getByLabel("บัญชีผู้ใช้")).toBeVisible({ timeout: 20_000 });
}

/** Locator เฉพาะการ์ดสินค้า: ลิงก์ /product/... ที่มีรูป (ไม่รวม sidebar/footer) */
export function productCards(page: Page) {
  return page.locator("a[href^='/product/']", { has: page.locator("img") });
}

/** เปิดสินค้าชิ้นแรกบน /shop และ return href */
export async function firstProductHref(page: Page): Promise<string> {
  await page.goto("/shop");
  const card = productCards(page).first();
  await expect(card).toBeVisible({ timeout: 20_000 });
  return (await card.getAttribute("href"))!;
}

/** เพิ่มสินค้าชิ้นแรกลงตะกร้า (ต้อง login แล้ว) และรอ badge */
export async function addFirstProductToCart(page: Page) {
  const href = await firstProductHref(page);
  await page.goto(href);
  await page.getByRole("button", { name: /เพิ่มลงตะกร้า/ }).click();
  await expect(page.getByLabel("ตะกร้าสินค้า").getByText(/\d+/)).toBeVisible({ timeout: 20_000 });
  return href;
}
