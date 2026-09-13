import { test, expect } from "@playwright/test";
import { login, SEED, expectLoggedIn } from "./helpers/auth";

test.describe("ระบบสมาชิก (Auth)", () => {
  test("สมัครสมาชิกใหม่สำเร็จ", async ({ page }) => {
    const email = `user_${Date.now()}@test.com`;
    await page.goto("/register");
    await page.getByLabel("ชื่อ-นามสกุล").fill("ผู้ทดสอบ");
    await page.getByLabel("อีเมล").fill(email);
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill("secret123");
    await page.getByLabel("ยืนยันรหัสผ่าน").fill("secret123");
    await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
    await expectLoggedIn(page, "ผู้ทดสอบ");
  });

  test("สมัครด้วยรหัสผ่านไม่ตรงกันแสดง error", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("ชื่อ-นามสกุล").fill("ผู้ทดสอบ");
    await page.getByLabel("อีเมล").fill("x@test.com");
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill("secret123");
    await page.getByLabel("ยืนยันรหัสผ่าน").fill("different456");
    await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
    await expect(page.getByText("รหัสผ่านไม่ตรงกัน")).toBeVisible();
  });

  test("เข้าสู่ระบบด้วยบัญชี seed สำเร็จและ logout ได้", async ({ page }) => {
    await login(page, SEED.customer);
    await expectLoggedIn(page, SEED.customer.email === "customer@shop.com" ? "ลูกค้าตัวอย่าง" : "");
    await page.goto("/");
    // logout ผ่าน dropdown เมนูบัญชี
    await page.getByLabel("บัญชีผู้ใช้").click();
    await page.getByRole("button", { name: "ออกจากระบบ" }).click();
    await expect(page.getByRole("link", { name: "เข้าสู่ระบบ" })).toBeVisible();
  });

  test("เข้าสู่ระบบด้วยรหัสผ่านผิดเห็นerror", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("อีเมล").fill(SEED.customer.email);
    await page.getByLabel("รหัสผ่าน").fill("wrong-password");
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await expect(page.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/)).toBeVisible();
  });
});
