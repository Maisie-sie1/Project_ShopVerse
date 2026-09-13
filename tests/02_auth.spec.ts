import { test, expect } from "@playwright/test";
import { login, registerNewUser, SEED } from "./helpers/auth";

test.describe("TS-02: Auth & RBAC", () => {
  test("TC AUTH-001: สมัครสมาชิกใหม่สำเร็จและเข้าสู่ระบบอัตโนมัติ", async ({ page }) => {
    await registerNewUser(page);
    // header มีปุ่มบัญชี (initial "ผ") = login แล้ว
    await expect(page.getByLabel("บัญชีผู้ใช้")).toBeVisible();
  });

  test("TC AUTH-002: สมัครด้วยรหัสยืนยันไม่ตรงกัน ขึ้น error", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("ชื่อ-นามสกุล").fill("ผู้ทดสอบ");
    await page.getByLabel("อีเมล").fill("dup_check@test.com");
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill("secret123");
    await page.getByLabel("ยืนยันรหัสผ่าน").fill("different456");
    await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
    await expect(page.getByText("รหัสผ่านไม่ตรงกัน")).toBeVisible();
    // ยังไม่ redirect
    await expect(page).toHaveURL(/\/register/);
  });

  test("TC AUTH-003: เข้าสู่ระบบด้วยบัญชี seed customer สำเร็จ", async ({ page }) => {
    await login(page, SEED.customer);
    await expect(page.getByLabel("บัญชีผู้ใช้")).toContainText("ล");
  });

  test("TC AUTH-004: เข้าสู่ระบบด้วยรหัสผิด ขึ้น error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("อีเมล").fill(SEED.customer.email);
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill("wrongpassword");
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await expect(page.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง/)).toBeVisible();
    // ยังอยู่หน้า login
    await expect(page).toHaveURL(/\/login/);
  });

  test("TC AUTH-005: ออกจากระบบแล้ว header กลับเป็นปุ่มเข้าสู่ระบบ", async ({ page }) => {
    await login(page, SEED.customer);
    await page.getByLabel("บัญชีผู้ใช้").click();
    await page.getByRole("button", { name: "ออกจากระบบ" }).click();
    await expect(page.getByRole("link", { name: "เข้าสู่ระบบ" })).toBeVisible();
    await expect(page.getByLabel("บัญชีผู้ใช้")).toHaveCount(0);
  });

  test("TC AUTH-006: RBAC — customer เข้า /admin ถูก redirect ออก", async ({ page }) => {
    await login(page, SEED.customer);
    await page.goto("/admin");
    await page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/admin/);
  });
});
