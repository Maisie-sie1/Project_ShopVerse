import { test, expect } from "@playwright/test";
import { login, SEED } from "./helpers/auth";

test.describe("TS-05: Admin Panel", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await login(page, SEED.admin);
  });

  test("TC ADM-001: Dashboard แสดงสถิติ", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "แผงผู้ดูแลระบบ" })).toBeVisible();
    const main = page.locator("main");
    await expect(main.getByText("ยอดขายรวม")).toBeVisible();
    await expect(main.getByText("คำสั่งซื้อทั้งหมด")).toBeVisible();
    await expect(main.getByText("สินค้าทั้งหมด")).toBeVisible();
  });

  test("TC ADM-002: เพิ่มสินค้าใหม่ → เห็นในตาราง", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page.getByPlaceholder("ค้นหาสินค้า...")).toBeVisible();

    await page.getByRole("link", { name: "+ เพิ่มสินค้า" }).click();
    await expect(page).toHaveURL(/\/admin\/products\/new/);

    // รอฟอร์มโหลด (input name พร้อม)
    const nameInput = page.getByLabel("ชื่อสินค้า *");
    await expect(nameInput).toBeVisible({ timeout: 20_000 });

    const name = `สินค้าทดสอบ ${Date.now()}`;
    await nameInput.fill(name);
    await page.getByLabel("ราคา (บาท) *").fill("250");
    await page.getByLabel("สต็อก (ชิ้น) *").fill("10");
    const imageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085";
    await page.getByPlaceholder("https://example.com/image.jpg").fill(imageUrl);
    await page.getByLabel("คำอธิบาย *").fill("สินค้าทดสอบสำหรับ automated test 123456");

    // ยืนยันค่าถูกกรอกครบก่อน submit (กัน fill fail เงียบ)
    await expect(nameInput).toHaveValue(name);
    await expect(page.getByPlaceholder("https://example.com/image.jpg")).toHaveValue(imageUrl);

    await page.getByRole("button", { name: "เพิ่มสินค้า" }).click();

    await expect(page).toHaveURL(/\/admin\/products(?!\/new)/, { timeout: 20_000 });
    const table = page.locator("table tbody");
    await expect(table).toBeVisible({ timeout: 20_000 });
    await expect(table.getByText(name)).toBeVisible({ timeout: 20_000 });
  });

  test("TC ADM-003: เปลี่ยนสถานะคำสั่งซื้อได้", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: "จัดการคำสั่งซื้อ" })).toBeVisible();

    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 20_000 });
    const orderSelect = firstRow.locator("select");
    await orderSelect.selectOption("PROCESSING");
    await expect(orderSelect).toHaveValue("PROCESSING", { timeout: 20_000 });
  });
});

test.describe("TS-05b: RBAC — admin API", () => {
  test("TC ADM-004: ลูกค้าเรียก /api/admin/stats ได้ 403", async ({ page }) => {
    await login(page, SEED.customer);
    const res = await page.request.get("/api/admin/stats");
    expect(res.status()).toBe(403);
  });

  test("TC ADM-005: ลูกค้า PATCH /api/orders (เปลี่ยนสถานะ) ได้ 403", async ({ page }) => {
    await login(page, SEED.customer);
    const res = await page.request.patch("/api/orders", {
      data: { orderId: "fake-id", status: "PROCESSING" },
    });
    expect(res.status()).toBe(403);
  });
});
