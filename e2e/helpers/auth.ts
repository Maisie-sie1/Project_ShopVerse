import { expect, type Page } from "@playwright/test";

/** Seed accounts (see prisma/seed.ts) */
export const SEED = {
  admin: { email: "admin@shop.com", password: "admin123" },
  customer: { email: "customer@shop.com", password: "customer123" },
} as const;

/** Register a fresh user through the UI and log them in. Returns the email. */
export async function registerNewUser(page: Page): Promise<string> {
  const email = `e2e_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
  await page.goto("/register");
  await page.getByLabel("ชื่อ-นามสกุล").fill("ผู้ทดสอบ E2E");
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill("secret123");
  await page.getByLabel("ยืนยันรหัสผ่าน").fill("secret123");
  await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
  await expect(page.getByLabel("บัญชีผู้ใช้")).toBeVisible({ timeout: 15_000 });
  return email;
}

/** Log in through the real UI and wait until the session cookie is set. */
export async function login(
  page: Page,
  { email, password }: { email: string; password: string }
) {
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await expect(page.getByLabel("บัญชีผู้ใช้")).toBeVisible({ timeout: 15_000 });
}

/** Assert the header shows the logged-in user's initial. */
export async function expectLoggedIn(page: Page, name: string) {
  await expect(page.getByLabel("บัญชีผู้ใช้")).toBeVisible();
  await expect(page.getByLabel("บัญชีผู้ใช้")).toHaveText(name.charAt(0));
}

/** Open the first product card link (with an image) and return its href. */
export async function firstProductHref(page: Page) {
  const card = page.locator("a[href^='/product/']", { has: page.locator("img") }).first();
  await card.waitFor();
  return (await card.getAttribute("href"))!;
}

/**
 * Go to the first product page and click "เพิ่มลงตะกร้า".
 * Requires being logged in. Returns the product slug.
 */
export async function addFirstProductToCart(page: Page) {
  const href = await firstProductHref(page);
  await page.goto(href);
  const addBtn = page.getByRole("button", { name: /เพิ่มลงตะกร้า/ });
  await addBtn.click();
  await expect(page.getByLabel("ตะกร้าสินค้า").getByText(/\d+/)).toBeVisible();
  return href.replace("/product/", "");
}
