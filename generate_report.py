"""สร้าง test-automation.xlsx จากผลการทดสอบจริงของ ShopVerse (QA ไม่แก้ application code)"""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()

# ---------- Styles ----------
TITLE_FONT = Font(name="Segoe UI", size=16, bold=True, color="1E3A8A")
HEADER_FONT = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
HEADER_FILL = PatternFill("solid", start_color="1E3A8A")
SECTION_FONT = Font(name="Segoe UI", size=13, bold=True, color="1E3A8A")
BOLD = Font(name="Segoe UI", size=10, bold=True)
REGULAR = Font(name="Segoe UI", size=10)
PASS_FILL = PatternFill("solid", start_color="C6EFCE")
FAIL_FILL = PatternFill("solid", start_color="FFC7CE")
WARN_FILL = PatternFill("solid", start_color="FFEB9C")
THIN = Side(style="thin", color="D1D5DB")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="top")

def style_header(ws, row, ncols):
    for c in range(1, ncols + 1):
        cell = ws.cell(row=row, column=c)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        cell.border = BORDER

def style_body(ws, start_row, end_row, ncols):
    for r in range(start_row, end_row + 1):
        for c in range(1, ncols + 1):
            cell = ws.cell(row=r, column=c)
            cell.font = REGULAR
            cell.alignment = WRAP
            cell.border = BORDER

def status_fill(ws, row, col, status):
    if status == "PASS":
        ws.cell(row=row, column=col).fill = PASS_FILL
    elif status == "FAIL":
        ws.cell(row=row, column=col).fill = FAIL_FILL
    elif status in ("BLOCKED",):
        ws.cell(row=row, column=col).fill = WARN_FILL

# ---------- Sheet 1: Summary ----------
ws = wb.active
ws.title = "Summary"
ws["A1"] = "ShopVerse — Test Automation Summary"
ws["A1"].font = TITLE_FONT
ws["A2"] = "Playwright E2E | 2026-09-13 | QA: Senior QA Automation Engineer"
ws["A2"].font = Font(name="Segoe UI", size=11, italic=True, color="4B5563")

summary_data = [
    ("Metric", "Value"),
    ("Total Test Cases (UI E2E)", 21),
    ("PASS (Chromium UI)", 21),
    ("FAIL (Chromium UI)", 0),
    ("PASS (WebKit UI)", 5),
    ("FAIL (WebKit UI)", 16),
    ("Total API Test Cases", 40),
    ("PASS (API)", 40),
    ("FAIL (API)", 0),
    ("Bugs Found", 1),
    ("Critical Bugs", 1),
    ("Coverage (Modules)", "Storefront, Auth, Cart, Checkout, Admin, RBAC, REST API"),
    ("Environments", "Chromium (UI), WebKit (UI), API request context"),
    ("App URL", "http://localhost:3000"),
]
for i, (k, v) in enumerate(summary_data, start=4):
    ws.cell(row=i, column=1, value=k).font = BOLD
    ws.cell(row=i, column=2, value=v).font = REGULAR
    ws.cell(row=i, column=1).border = BORDER
    ws.cell(row=i, column=2).border = BORDER
ws.column_dimensions["A"].width = 28
ws.column_dimensions["B"].width = 60

# ---------- Sheet 2: Test Cases ----------
ws2 = wb.create_sheet("Test Cases")
headers2 = ["ID", "Feature", "Scenario", "Role", "Priority", "Expected", "Status (Chromium)", "Status (WebKit)", "Bug ID", "Notes"]
ws2.append(headers2)
style_header(ws2, 1, len(headers2))

tests = [
    ("STORE-001", "Storefront", "โหลดหน้าแรก แสดง hero + สินค้าแนะนำ", "Guest", "Critical", "Hero + การ์ดสินค้าโผล่", "PASS", "PASS", "", ""),
    ("STORE-002", "Storefront", "ปุ่ม CTA ไป /shop", "Guest", "Medium", "Redirect /shop + heading", "PASS", "PASS", "", ""),
    ("STORE-003", "Storefront", "กรองหมวดหมู่ drinks", "Guest", "Critical", "เห็นสินค้าเครื่องดื่ม", "PASS", "PASS", "", ""),
    ("STORE-004", "Storefront", "ค้นหา 'กาแฟ'", "Guest", "High", "ผลการค้นหามี กาแฟ", "PASS", "PASS", "", ""),
    ("STORE-005", "Storefront", "เปิดหน้าสินค้า", "Guest", "Critical", "h1 + ปุ่มเพิ่ม", "PASS", "PASS", "", ""),
    ("AUTH-001", "Auth", "สมัครสมาชิกสำเร็จ", "Guest", "Critical", "Login ทันที + ปุ่มบัญชี", "PASS", "FAIL", "BUG-001", "WebKit: cookie ไม่ set"),
    ("AUTH-002", "Auth", "สมัครรหัสยืนยันไม่ตรงกัน", "Guest", "High", "error 'รหัสผ่านไม่ตรงกัน'", "PASS", "PASS", "", "Validation ทำงานก่อน API"),
    ("AUTH-003", "Auth", "เข้าสู่ระบบ seed customer", "Guest", "Critical", "ปุ่มบัญชีโผล่", "PASS", "FAIL", "BUG-001", ""),
    ("AUTH-004", "Auth", "เข้าสู่ระบบรหัสผิด", "Guest", "High", "error 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'", "PASS", "PASS", "", "ไม่มี cookie => ไม่ login (ถูกต้อง)"),
    ("AUTH-005", "Auth", "ออกจากระบบ", "Customer", "High", "header กลับ 'เข้าสู่ระบบ'", "PASS", "FAIL", "BUG-001", "ต้อง login ก่อน"),
    ("AUTH-006", "Auth", "RBAC: customer → /admin redirect", "Customer", "Critical", "redirect ออกจาก /admin", "PASS", "FAIL", "BUG-001", "ต้อง login ก่อน"),
    ("CART-001", "Cart", "เพิ่มสินค้า → badge", "Customer", "Critical", "badge ≥ 1", "PASS", "FAIL", "BUG-001", ""),
    ("CART-002", "Cart", "หน้า /cart เปลี่ยนจำนวน", "Customer", "High", "qty เพิ่มขึ้น", "PASS", "FAIL", "BUG-001", ""),
    ("CART-003", "Cart", "ลบสินค้า → ว่าง", "Customer", "High", "ข้อความ 'ตะกร้าว่างเปล่า'", "PASS", "FAIL", "BUG-001", ""),
    ("CHK-001", "Checkout", "สั่งซื้อ COD สำเร็จ", "Customer", "Critical", "redirect order detail + ORD-", "PASS", "FAIL", "BUG-001", ""),
    ("CHK-002", "Checkout", "ไม่กรอกที่อยู่ validation", "Customer", "High", "ยังอยู่ /checkout", "PASS", "FAIL", "BUG-001", "ต้อง login ก่อน"),
    ("ADM-001", "Admin", "Dashboard สถิติ", "Admin", "Critical", "การ์ดสถิติโผล่", "PASS", "FAIL", "BUG-001", ""),
    ("ADM-002", "Admin", "เพิ่มสินค้า → เห็นในตาราง", "Admin", "Critical", "redirect + ชื่อสินค้าในตาราง", "PASS", "FAIL", "BUG-001", ""),
    ("ADM-003", "Admin", "เปลี่ยนสถานะ order", "Admin", "High", "select = PROCESSING", "PASS", "FAIL", "BUG-001", ""),
    ("ADM-004", "Admin/RBAC", "ลูกค้าเรียก /api/admin/stats → 403", "Customer", "Critical", "403", "PASS", "FAIL", "BUG-001", "API ใช้ cookie auth; WebKit ไม่มี cookie"),
    ("ADM-005", "Admin/RBAC", "ลูกค้า PATCH /api/orders → 403", "Customer", "Critical", "403", "PASS", "FAIL", "BUG-001", ""),
]
for row in tests:
    ws2.append(row)
style_body(ws2, 2, len(tests) + 1, len(headers2))
for r, row in enumerate(tests, start=2):
    status_fill(ws2, r, 7, row[6])
    status_fill(ws2, r, 8, row[7])
widths2 = [12, 14, 34, 10, 10, 34, 18, 18, 10, 26]
for i, w in enumerate(widths2, start=1):
    ws2.column_dimensions[get_column_letter(i)].width = w

# ---------- Sheet 3: Bugs ----------
ws3 = wb.create_sheet("Bugs")
headers3 = ["Bug ID", "Feature", "Severity", "Priority", "Expected", "Actual",
            "Possible Cause", "Suggested Fix", "Related Test", "Status"]
ws3.append(headers3)
style_header(ws3, 1, len(headers3))
bug = [
    "BUG-001",
    "Authentication / Session",
    "Critical",
    "P0",
    "ตั้ง session cookie หลัง login/register แล้ว header แสดง logged-in",
    "WebKit: ไม่มี cookie shop_session (cookies=[]) → login/ทุก flow ที่ต้อง auth ล้มเหลว",
    "Set-Cookie จาก cookies().set() ใน src/lib/auth.ts ไม่ถูก WebKit เก็บ (localhost/http + httpOnly/sameSite) — วิเคราะห์จาก evidence ยังไม่ยืนยัน 100%",
    "ตรวจ attributes (secure/sameSite) บน localhost; ลอง HTTPS dev; fallback ในการส่ง token สำหรับ Safari",
    "AUTH-001/003/005/006, CART-*, CHK-*, ADM-*",
    "Open",
]
ws3.append(bug)
style_body(ws3, 2, 2, len(headers3))
ws3.cell(row=2, column=3).fill = FAIL_FILL
widths3 = [12, 26, 10, 10, 34, 40, 42, 42, 24, 10]
for i, w in enumerate(widths3, start=1):
    ws3.column_dimensions[get_column_letter(i)].width = w

# ---------- Sheet 4: Verification ----------
ws4 = wb.create_sheet("Verification")
headers4 = ["Command", "Type", "Result", "Notes"]
ws4.append(headers4)
style_header(ws4, 1, len(headers4))
verifications = [
    ("npm run lint", "Lint (ESLint)", "PASS", "ไม่มี error/warning"),
    ("npx tsc --noEmit", "TypeCheck", "PASS", "ผ่าน (ไม่มี script typecheck ใน package.json)"),
    ("npm run build", "Build", "PASS", "next build ผ่าน (prisma generate && next build)"),
    ("npm run test:e2e (chromium)", "E2E", "PASS", "21/21 ผ่าน"),
    ("npm run test:e2e (webkit)", "E2E", "FAIL", "16 fail — ทั้งหมดจาก BUG-001"),
    ("npx playwright test --project=api", "API Tests", "PASS", "40/40 ผ่าน (request context)"),
    ("npm run db:seed", "Seed", "PASS", "seed สำเร็จก่อนรันเทสต์"),
]
for i, row in enumerate(verifications, start=2):
    ws4.append(row)
style_body(ws4, 2, len(verifications) + 1, len(headers4))
for r in range(2, len(verifications) + 2):
    status_fill(ws4, r, 3, ws4.cell(row=r, column=3).value)
widths4 = [26, 16, 10, 46]
for i, w in enumerate(widths4, start=1):
    ws4.column_dimensions[get_column_letter(i)].width = w

# ---------- Sheet 5: Coverage ----------
ws5 = wb.create_sheet("Coverage")
headers5 = ["Module / Feature", "Covered", "Test IDs", "Priority"]
ws5.append(headers5)
style_header(ws5, 1, len(headers5))
coverage = [
    ("Storefront & Catalog", "Yes", "STORE-001..005", "Critical/High"),
    ("Authentication (Register/Login/Logout)", "Yes", "AUTH-001..005", "Critical"),
    ("RBAC / Authorization", "Yes", "AUTH-006, ADM-004, ADM-005", "Critical"),
    ("Cart", "Yes", "CART-001..003", "Critical/High"),
    ("Checkout & Orders", "Yes", "CHK-001..002", "Critical"),
    ("Admin Panel (Dashboard/Product CRUD/Order status)", "Yes", "ADM-001..003", "Critical/High"),
    ("Validation / Negative cases", "Yes", "AUTH-002, AUTH-004, CHK-002", "High"),
    ("Cross-browser (Chromium + WebKit)", "Yes", "All", "High"),
    ("ไม่ครอบคลุม: payment จริง, webhook, สลิป, coupon", "No (out of scope)", "-", "Low"),
]
for i, row in enumerate(coverage, start=2):
    ws5.append(row)
style_body(ws5, 2, len(coverage) + 1, len(headers5))
for i, w in enumerate([34, 12, 26, 16], start=1):
    ws5.column_dimensions[get_column_letter(i)].width = w

# ---------- Sheet 6: API Tests ----------
ws6 = wb.create_sheet("API Tests")
headers6 = ["ID", "API", "Scenario", "Role", "Priority", "Expected", "Status"]
ws6.append(headers6)
style_header(ws6, 1, len(headers6))
api_tests = [
    ("API-AUTH-001", "POST /auth/register", "ลงทะเบียนสำเร็จ", "Guest", "Critical", "201 + user + ไม่ leak hash", "PASS"),
    ("API-AUTH-002", "POST /auth/register", "email ซ้ำ", "Guest", "High", "409", "PASS"),
    ("API-AUTH-003", "POST /auth/register", "ข้อมูลไม่ valid", "Guest", "High", "422", "PASS"),
    ("API-AUTH-004", "POST /auth/login", "login สำเร็จ", "Guest", "Critical", "200 + user", "PASS"),
    ("API-AUTH-005", "POST /auth/login", "รหัสผิด", "Guest", "Critical", "401", "PASS"),
    ("API-AUTH-006", "GET /auth/me", "ไม่มี session", "Guest", "High", "user null", "PASS"),
    ("API-AUTH-007", "GET /auth/me", "มี session", "Customer", "High", "คืน user", "PASS"),
    ("API-AUTH-008", "POST /auth/logout", "logout แล้ว me null", "Customer", "High", "null", "PASS"),
    ("API-AUTH-009", "register→me (context)", "session cookie ทำงาน", "Customer", "High", "me ไม่ null", "PASS"),
    ("API-PRD-001", "GET /products", "รายการ + pagination", "Guest", "Critical", "200", "PASS"),
    ("API-PRD-002", "GET /products?category", "กรองหมวด", "Guest", "High", "เฉพาะหมวด", "PASS"),
    ("API-PRD-003", "GET /products?search", "ค้นหาภาษาไทย", "Guest", "High", "ผลมีคำค้น", "PASS"),
    ("API-PRD-004", "GET /products?min/max", "กรองราคา", "Guest", "High", "ช่วงราคาถูก", "PASS"),
    ("API-PRD-005", "GET /products/[slug]", "รายละเอียด + reviews", "Guest", "Critical", "200", "PASS"),
    ("API-PRD-006", "GET /products/[slug]", "ไม่มีสินค้า", "Guest", "Medium", "404", "PASS"),
    ("API-PRD-007", "POST /products", "ไม่มี session", "Guest", "Critical", "401", "PASS"),
    ("API-PRD-008", "POST /products", "admin สำเร็จ", "Admin", "Critical", "201", "PASS"),
    ("API-PRD-009", "POST /products", "ข้อมูลไม่ valid", "Admin", "High", "422", "PASS"),
    ("API-PRD-010", "POST /products", "customer", "Customer", "Critical", "403", "PASS"),
    ("API-CAT-001", "GET /categories", "รายการ", "Guest", "Medium", "200", "PASS"),
    ("API-CAT-002", "POST /categories", "ไม่มี session", "Guest", "High", "401", "PASS"),
    ("API-CAT-002b", "POST /categories", "customer", "Customer", "High", "403", "PASS"),
    ("API-CAT-003", "POST /categories", "admin สำเร็จ + ซ้ำ", "Admin", "High", "201/409", "PASS"),
    ("API-CART-001", "GET /cart", "ไม่ login", "Guest", "Critical", "401", "PASS"),
    ("API-CART-002", "POST /cart", "เพิ่มสินค้า", "Customer", "Critical", "200 + itemCount", "PASS"),
    ("API-CART-003", "POST /cart", "เกินสต็อก", "Customer", "High", "422", "PASS"),
    ("API-CART-004", "PATCH /cart/[id]", "เปลี่ยนจำนวน", "Customer", "High", "200", "PASS"),
    ("API-CART-005", "DELETE /cart/[id]", "ลบ item", "Customer", "High", "200 + ว่าง", "PASS"),
    ("API-ORD-001", "POST /orders", "ไม่ login", "Guest", "Critical", "401", "PASS"),
    ("API-ORD-002", "POST /orders", "checkout สำเร็จ + ลด stock", "Customer", "Critical", "201 + ORD-", "PASS"),
    ("API-ORD-003", "POST /orders", "ไม่มี session", "Guest", "High", "401", "PASS"),
    ("API-ORD-003b", "POST /orders", "body ไม่ valid", "Customer", "High", "422", "PASS"),
    ("API-ORD-004", "GET /orders", "เห็นเฉพาะของตัวเอง", "Customer", "Critical", "เฉพาะ user", "PASS"),
    ("API-ADM-001", "PATCH /orders", "ไม่มี session", "Guest", "Critical", "401", "PASS"),
    ("API-ADM-001b", "PATCH /orders", "customer", "Customer", "Critical", "403", "PASS"),
    ("API-ADM-002", "PATCH /orders", "status ไม่ valid", "Admin", "High", "422", "PASS"),
    ("API-ADM-003", "GET /orders?scope=all", "admin เห็นทั้งหมด", "Admin", "High", "200", "PASS"),
    ("API-ADM-004", "GET /admin/stats", "ไม่มี session", "Guest", "Critical", "401", "PASS"),
    ("API-ADM-005", "GET /admin/stats", "customer", "Customer", "Critical", "403", "PASS"),
    ("API-ADM-006", "GET /admin/stats", "admin", "Admin", "High", "200 + stats", "PASS"),
]
for row in api_tests:
    ws6.append(row)
style_body(ws6, 2, len(api_tests) + 1, len(headers6))
for r, row in enumerate(api_tests, start=2):
    status_fill(ws6, r, 7, row[6])
for i, w in enumerate([16, 22, 26, 10, 10, 22, 10], start=1):
    ws6.column_dimensions[get_column_letter(i)].width = w

wb.save("test-automation.xlsx")
print("✅ Created test-automation.xlsx")