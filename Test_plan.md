# 📋 Test Plan — ShopVerse E-Commerce (Playwright E2E)

> สร้างโดย: Senior QA Automation Engineer
> วันที่: 2026-09-13
> แอปเป้าหมาย: ShopVerse — Next.js 16 (App Router) + PostgreSQL (Neon) + Prisma + REST API

---

## 1. ภาพรวม (Overview)

ทดสอบระบบ E2E ผ่าน UI จริงด้วย Playwright ครอบคลุมเส้นทางผู้ใช้หลักตาม **Business Risk**
โดยไม่พึ่งข้อมูล production — แต่ละเทสต์สร้างข้อมูลของตัวเอง (register user ใหม่ / seed data)
และตรวจ **ผลลัพธ์จริง** (redirect, ข้อมูลในหน้า, badge, สถานะ) ไม่ใช่แค่คลิกผ่าน

## 2. ขอบเขตการทดสอบ (Test Scope)

| ด้าน | ในขอบเขต | นอกขอบเขต |
|---|---|---|
| Storefront | หน้าแรก, /shop (กรอง/ค้นหา), หน้าสินค้า | Design นอกเหนือจากนี้ |
| Auth | register, login, logout, session cookie | OAuth / SSO / forgot password |
| Cart | เพิ่ม, เปลี่ยนจำนวน, ลบ, badge | คูปอง / ส่งฟรีเกิน 1 เงื่อนไข |
| Checkout | กรอกที่อยู่, วิธีชำระ, shipping fee, stock ตัด, order number | ชำระเงินจริง / webhook |
| Orders | ประวัติ, รายละเอียด, สถานะ (admin) | สลิป / การพิมพ์ |
| Admin | สถิติ, CRUD สินค้า, เปลี่ยนสถานะ order | การตั้งค่าระบบอื่น |
| RBAC | customer กัน admin route/API | เพิ่ม role ใหม่ |

## 3. สภาพแวดล้อม (Environment & Data)

- **Env**: เลือกใช้ local (`http://localhost:3000`) ผ่าน `webServer` ใน Playwright config
- **DB**: Neon (จาก `.env.local`) — seed ให้สะอาดก่อนรัน (`npm run db:seed`)
- **Seed accounts**:
  - Admin: `admin@shop.com` / `admin123` (role ADMIN)
  - Customer: `customer@shop.com` / `customer123` (role CUSTOMER)
- **Test data**: เทสต์ที่แตะตะกร้า/สั่งซื้อ **register user ใหม่** เพื่อไม่ให้ชนกันตอน parallel

## 4. Critical User Flows (เรียงตามความเสี่ยงธุรกิจ)

1. ผู้เยี่ยมชม → ดูสินค้า → สมัคร/ล็อกอิน → เพิ่มลงตะกร้า → checkout → เห็น order number
2. Admin → ล็อกอิน → จัดการสินค้า (เพิ่ม/ซ่อน) → อัปเดตสถานะ order
3. RBAC — customer ต้องเข้า admin /เข้าถึง API admin ไม่ได้
4. Validation — ฟอร์ม login/register/checkout รับค่าผิดต้องแสดง error

## 5. รายละเอียด Test Cases

### TS-01 Storefront & Catalog
| ID | Scenario | Role | Priority | Steps | Expected | Acceptance |
|---|---|---|---|---|---|---|
| STORE-001 | โหลดหน้าแรก | Guest | **Critical** | `goto /` | Hero + สินค้าแนะนำ ≥ 1 | Title มี ShopVerse, การ์ดสินค้าโผล่ |
| STORE-002 | CTA → shop | Guest | Medium | กด "เริ่มช้อปปิ้ง" | ไป /shop | heading "สินค้าทั้งหมด" |
| STORE-003 | กรองหมวดหมู่ | Guest | **Critical** | `/shop?category=drinks` | เห็นสินค้าเครื่องดื่ม | การ์ดสินค้าโผล่ ≥ 1 |
| STORE-004 | ค้นหา | Guest | High | `/shop?search=กาแฟ` | เห็นผล "กาแฟ" | img alt มีคำว่า กาแฟ |
| STORE-005 | หน้าสินค้า | Guest | **Critical** | กดการ์ด → /product/[slug] | h1 + ปุ่มเพิ่มลงตะกร้า | ราคา/รายละเอียดแสดง |

### TS-02 Auth & RBAC
| ID | Scenario | Role | Priority | Steps | Expected | Acceptance |
|---|---|---|---|---|---|---|
| AUTH-001 | Register สำเร็จ | Guest | **Critical** | สมัครด้วยข้อมูลใหม่ | login ทันที (cookie set) | Header มีปุ่มบัญชี (initial) |
| AUTH-002 | Register รหัสไม่ตรง | Guest | High | ยืนยันรหัสต่างกัน | error "รหัสผ่านไม่ตรงกัน" | ขึ้นอยู่นี้ ไม่ redirect |
| AUTH-003 | Login สำเร็จ | Guest | **Critical** | seed customer login | ไปหน้าถัดไป | ปุ่มบัญชีโผล่ |
| AUTH-004 | Login รหัสผิด | Guest | High | รหัสผิด | error "อีเมลหรือรหัสผ่านไม่ถูกต้อง" | ขึ้น error ไม่ redirect |
| AUTH-005 | Logout | Customer | High | กดออกจากระบบ | กลับหน้าแรก, header "เข้าสู่ระบบ" | ไม่มีปุ่มบัญชีเหลือ |
| AUTH-006 | RBAC: customer → /admin | Customer | **Critical** | `goto /admin` | redirect ออกจาก /admin | URLเปลี่ยน/ถูกบล็อก |

### TS-03 Cart
| ID | Scenario | Role | Priority | Steps | Expected | Acceptance |
|---|---|---|---|---|---|---|
| CART-001 | เพิ่มสินค้า → badge | Customer | **Critical** | หน้าสินค้า กดเพิ่ม | badge จำนวน ≥ 1 | badge โผล่บน header |
| CART-002 | หน้า /cart + เปลี่ยนจำนวน | Customer | High | ไป /cart กด + | จำนวนเพิ่มจากค่าเดิม | qty เพิ่มขึ้นจริง |
| CART-003 | ลบสินค้า | Customer | High | กดลบ | ตะกร้าว่าง | ข้อความ "ตะกร้าว่างเปล่า" |

### TS-04 Checkout
| ID | Scenario | Role | Priority | Steps | Expected | Acceptance |
|---|---|---|---|---|---|---|
| CHK-001 | สั่งซื้อสำเร็จ (COD) | Customer | **Critical** | เติมตะกร้า → /checkout กรอกที่อยู่ → ยืนยัน | redirect ไป order detail, เห็น ORD-... | เลข order โผล่, วิธีชำระ "เก็บเงินปลายทาง" |
| CHK-002 | ไม่กรอกที่อยู่ → validation | Customer | High | /checkout กดยืนยันทันที | browser required validation | URL ยังเป็น /checkout |

### TS-05 Admin
| ID | Scenario | Role | Priority | Steps | Expected | Acceptance |
|---|---|---|---|---|---|---|
| ADM-001 | Dashboard สถิติ | Admin | **Critical** | /admin | เห็นยอดขาย/ออเดอร์/สินค้า | การ์ดสถิติโผล่ |
| ADM-002 | เพิ่มสินค้า | Admin | **Critical** | /admin/products/new กรอกครบ → เพิ่ม | redirect /admin/products, เห็นชื่อสินค้าใหม่ | สินค้าโผล่ในตาราง |
| ADM-003 | เปลี่ยนสถานะ order | Admin | High | /admin/orders select → PROCESSING | select เป็น PROCESSING | ค่า select อัปเดต |
| ADM-004 | RBAC: admin API | Admin/Customer | **Critical** | customer เรียก /api/admin/stats | 403 | status 403 |

## 6. Test Data Strategy

- **Idempotent**: register user ใหม่ด้วย `e2e_<timestamp>@test.com` → ไม่ชนกับ data อื่น
- **สินค้า**: ใช้ seed products (10 รายการ) — ไม่แก้ข้อมูล production จริง
- **Order**: สร้างผ่าน UI จริง (checkout) → ตรวจผลลัพธ์ทันที
- **Clean-up**: หลังรันเทสต์ QA แจ้งทีม dev ทำ `npm run db:seed` ล้าง data ทดสอบ

## 7. Bug Handling

- ห้ามแก้ source code / business logic / UI เพื่อให้เทสต์ผ่าน
- พบ fail → record: Steps, Expected, Actual, Evidence (screenshot/trace), Severity, Potential Cause, Suggested Fix → report
- Bug ที่ block ขั้นต่อไป → mark **BLOCKED**

## 8. สถานะ (Status Definitions)

| Status | ความหมาย |
|---|---|
| PASS | รันจริงแล้วผ่าน |
| FAIL | รันจริงแล้วไม่ผ่าน (มี Bug) |
| BLOCKED | ไม่สามารถรันได้เพราะ bug/deadlock |
| NOT RUN | ยังไม่รัน |

---

## 9. ผลการทดสอบ (อัปเดตหลังรัน — Section นี้ใช้เป็นสรุป)

> รันเมื่อ: 2026-09-13 | Browser: Chromium (ผ่านครบ) + WebKit (พบ Bug)

| หมวด | ทั้งหมด | PASS | FAIL | BLOCKED | Notes |
|---|---|---|---|---|---|
| TS-01 Storefront | 5 | 5 | 0 | 0 | Chromium + WebKit ผ่าน |
| TS-02 Auth & RBAC | 6 | 6* | 6* | 0 | *Chromium ผ่าน / WebKit ล้มเหลว (BUG-001) |
| TS-03 Cart | 3 | 3* | 3* | 0 | *Chromium ผ่าน / WebKit ล้มเหลว (BUG-001) |
| TS-04 Checkout | 2 | 2* | 2* | 0 | *Chromium ผ่าน / WebKit ล้มเหลว (BUG-001) |
| TS-05 Admin | 5 | 5* | 5* | 0 | *Chromium ผ่าน / WebKit ล้มเหลว (BUG-001) |
| **รวม** | **21** | **21 (Chromium)** | **16 (WebKit)** | 0 | BUG-001 ส่งผล 16 เทสต์บน WebKit |

### Bugs ที่พบ

| Bug ID | Feature | Severity | Status | สรุป |
|---|---|---|---|---|
| BUG-001 | Auth/Session | **Critical** | Open | Session cookie ไม่ถูกตั้งบน WebKit/Safari — login/register/cart/checkout/admin ทั้งหมดล้มเหลวบน Safari |

*รายละเอียดเต็มใน `Bug_report.md`*
