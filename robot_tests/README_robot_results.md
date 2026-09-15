# 🐞 Robot Framework Bug Report — ShopVerse

> QA: Senior QA Automation Engineer | Framework: Robot Framework 7.5 + SeleniumLibrary 6.9
> วันที่: 2026-09-15 | ผลรวม: **23/23 passed** (มี 1 bug ที่ใช้ workaround)

---

## BUG-ROBOT-001 — Header dropdown (บัญชีผู้ใช้) ไม่ตอบสนองต่อ native click

```
Bug ID:           BUG-ROBOT-001
Feature:          Header / User Menu (src/components/layout/HeaderActions.tsx)
Severity:         High
Priority:         P1
Related Test:     RF-AUTH-005 (logout ผ่าน UI)
Environment:      Chrome 153 (headless), Selenium WebDriver
Status:           Open (QA not fixing — ส่งต่อ Dev)
```

### Steps to Reproduce

1. login เป็น customer@shop.com (ผ่าน UI)
2. คลิกปุ่ม "บัญชีผู้ใช้" (`button[aria-label='บัญชีผู้ใช้']`) ด้วย **Selenium native click**
3. สังเกต dropdown

### Expected

- dropdown เปิด แสดงเมนู (บัญชีของฉัน / ออกจากระบบ)

### Actual

- dropdown **ไม่เปิด** — `menuOpen` state ไม่เปลี่ยน (ไม่มี "ออกจากระบบ" / "บัญชีของฉัน" ใน DOM)
- แต่ถ้าใช้ **JavaScript click** (`element.click()`) → dropdown เปิดปกติ

### Evidence

- `robot_results/combined_log.html` — RF-AUTH-005 ครั้งแรก fail ("Element ... did not appear")
- Python/Selenium debug: native click → `logout btn count: 0`; JS click → `has logout: True`
- screenshot: อยู่ใน log (HTML report) ของอัปเดตครั้งหลัง

### Possible Cause (วิเคราะห์จากหลักฐาน — ยังไม่ยืนยัน)

- ปุ่มมี `onClick` React handler + conditional render `{menuOpen && ...}`
- native click ผ่าน Selenium ไม่ trigger React synthetic event (หรือถูก block)
- **ไม่เกี่ยวกับ Selenium library โดยเฉพาะ** — ผู้ใช้จริงอาจมีเมาส์คลิกปกติที่ได้ผล แต่ headless/บางกรณี native click ไม่ทำงาน
- เกี่ยวข้อง: conditional overlay `fixed inset-0` (ปุ่มปิดเมนู) อาจ intercept

### Suggested Fix (แนวทาง Dev — ไม่ implement)

1. ตรวจสอบว่า button ถูกต้อง (`type="button"`) และ onClick ทำงานกับ native event
2. ทดสอบกับผู้ใช้จริง (คลิกจริง) — ถ้าได้ผล แสดงว่าเป็น Selenium-specific
3. ถ้าเป็น React 17+ ใหม่ event delegation — ลองใช้ `onPointerDown` หรือ `onMouseDown` เพิ่ม
4. หรือเพิ่ม `data-testid` ให้ dropdown เพื่อให้ test เลือกได้ตรง

### Workaround ที่ใช้ใน test (QA)

- RF-AUTH-005 ใช้ `Execute JavaScript document.querySelector(...).click()` — ยังทดสอบ UI logout จริง

---

## สรุปผล Robot Framework Tests (รันจริง)

| Suite | Tests | PASS | FAIL | Notes |
|---|---|---|---|---|
| 01 Storefront | 4 | 4 | 0 | หน้าแรก/shop/ค้นหา/สินค้า |
| 02 Auth | 6 | 6 | 0 | register/login/logout/RBAC (ใช้ JS click workaround BUG-ROBOT-001) |
| 03 Cart | 3 | 3 | 0 | เพิ่ม/เปลี่ยนจำนวน/ลบ |
| 04 Checkout | 2 | 2 | 0 | สั่งซื้อ COD + validation |
| 05 API (RequestsLibrary) | 8 | 8 | 0 | register/login/products/cart/orders/RBAC 401/403 |
| **รวม** | **23** | **23** | **0** | |

> Bug เดิมจาก Playwright (BUG-001 WebKit cookie) ไม่กระทบ Robot เพราะ Robot ใช้ Chrome (cookie ทำงานปกติ) — แต่ BUG-001 ยัง Open รอ Dev แก้
