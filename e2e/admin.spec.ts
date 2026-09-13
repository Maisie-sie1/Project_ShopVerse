import { test, expect } from "@playwright/test";
import { login, SEED } from "./helpers/auth";

// Admin tests แตะข้อมูลร่วมกัน (คำสั่งซื้อ/สินค้า) -> รันแบบ serial เพื่อลด flake
// จาก race condition ระหว่างเทสต์

test.describe("แผงผู้ดูแลระบบ (Admin)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await login(page, SEED.admin);
  });

  test("dashboard แสดงสถิติ", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "แผงผู้ดูแลระบบ" })).toBeVisible();
    const main = page.locator("main");
    await expect(main.getByText("ยอดขายรวม")).toBeVisible();
    await expect(main.getByText("คำสั่งซื้อทั้งหมด")).toBeVisible();
    await expect(main.getByText("สินค้าทั้งหมด")).toBeVisible();
  });

  test("เพิ่มสินค้าใหม่แล้วเห็นในรายการ", async ({ page }) => {
    await page.goto("/admin/products");
    // หน้าโหลดแล้วมีช่องค้นหา (อยู่ใต้ nav "จัดการสินค้า")
    await expect(page.getByPlaceholder("ค้นหาสินค้า...")).toBeVisible();

    await page.getByRole("link", { name: "+ เพิ่มสินค้า" }).click();
    await expect(page).toHaveURL(/\/admin\/products\/new/);

    // รอให้ฟอร์มโหลดจริง (หลัง loading state หาย) ก่อนกรอก
    const nameInput = page.getByLabel("ชื่อสินค้า *");
    await expect(nameInput).toBeVisible({ timeout: 15_000 });

    const name = `สินค้าทดสอบ ${Date.now()}`;
    await nameInput.fill(name);
    await page.getByLabel("ราคา (บาท) *").fill("250");
    await page.getByLabel("สต็อก (ชิ้น) *").fill("10");
    const imageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085";
    const imageInput = page.getByPlaceholder("https://example.com/image.jpg");
    await imageInput.fill(imageUrl);
    await page.getByLabel("คำอธิบาย *").fill("สินค้าทดสอบสำหรับ automated test 123456");

    // ยืนยันค่าถูกกรอกครบก่อนกด submit (กัน fill fail เงียบๆ)
    await expect(nameInput).toHaveValue(name);
    await expect(page.getByPlaceholder("https://example.com/image.jpg")).toHaveValue(imageUrl);
    await expect(page.getByLabel("คำอธิบาย *")).toHaveValue(
      "สินค้าทดสอบสำหรับ automated test 123456"
    );

    await page.getByRole("button", { name: "เพิ่มสินค้า" }).click();

    await expect(page).toHaveURL(/\/admin\/products(?!\/new)/, { timeout: 15_000 });
    // รอตาราง re-fetch และมีแถวสินค้า (loading หาย)
    const table = page.locator("table tbody");
    await expect(table).toBeVisible({ timeout: 15_000 });
    await expect(table.getByText(name)).toBeVisible({ timeout: 15_000 });
  });

  test("เปลี่ยนสถานะคำสั่งซื้อได้", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: "จัดการคำสั่งซื้อ" })).toBeVisible();

    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 15_000 });
    const orderSelect = firstRow.locator("select");
    await orderSelect.selectOption("PROCESSING");
    await expect(orderSelect).toHaveValue("PROCESSING", { timeout: 15_000 });
  });
});

test.describe("สิทธิ์ผู้ดูแลระบบ", () => {
  test("ลูกค้าทั่วไปไม่สามารถเข้าหน้า /admin ได้", async ({ page }) => {
    await login(page, SEED.customer);
    await page.goto("/admin");
    // redirect ไปที่อื่น (หน้าแรก) เพราะไม่มีสิทธิ์
    await page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 10_000 });
    await expect(page).not.toHaveURL(/\/admin/);
  });
});
