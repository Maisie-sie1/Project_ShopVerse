# 🐞 Bug Report — ShopVerse

> QA: Senior QA Automation Engineer | วันที่: 2026-09-13
> หมายเหตุ: เป็นรายงานจากหลักฐานการทดสอบจริง (screenshot/trace/error context) — ห้ามแก้ application code

---

## BUG-001 — Session Cookie ไม่ถูกตั้งบนเบราว์เซอร์ WebKit (Safari)

```
Bug ID:           BUG-001
Feature:          Authentication / Session (ทุกฟีเจอร์ที่ต้อง login)
Severity:         Critical
Priority:         P0
Related Test:     AUTH-001, AUTH-003, AUTH-005, AUTH-006, CART-001/002/003,
                  CHK-001/002, ADM-001/002/003/004/005 (ทั้งหมดที่ต้อง login)
Environment:      WebKit (Safari) — localhost:3000, Node 24, Next 16.3.4
Status:           Open
```

### Steps to Reproduce

1. เปิดเว็บด้วยเบราว์เซอร์ WebKit (Safari engine)
2. ไปที่ `/login` หรือ `/register`
3. กรอกข้อมูลถูกต้อง (เช่น admin@shop.com / admin123)
4. กดปุ่ม submit

### Expected

- ระบบตั้ง session cookie ในเบราว์เซอร์
- redirect ไปหน้าถัดไป และ Header แสดงปุ่มบัญชีผู้ใช้ (logged-in state)

### Actual

- หน้าเว็บยังอยู่หน้าเดิม (ไม่ redirect / redirect แล้วกลับ login)
- Header ยังแสดง "เข้าสู่ระบบ" (ไม่ login)
- **`context.cookies()` → `[]` — ไม่มี cookie `shop_session` เลย** (เทียบกับ Chromium ที่มี ✅)

### Evidence

- Screenshot: `test-results/02_auth-...-webkit/test-failed-1.png`
- Trace: `test-results/02_auth-...-webkit-retry1/trace.zip`
- Playwright debug (ไม่แก้ code): WebKit `cookies=[]` vs Chromium พบ `shop_session`
- Error context: หลากหลาย `expect(locator ... 'บัญชีผู้ใช้')` timeout 20s

### Possible Cause (วิเคราะห์จากหลักฐาน — ยังไม่ยืนยัน)

- cookie ถูกส่งผ่าน header `Set-Cookie` จากเซิร์ฟเวอร์ (ผ่าน `cookies().set()` ใน `src/lib/auth.ts`) แต่
  WebKit engine ไม่อนุญาตให้ **httpOnly cookie** ถูกบันทึกในบริบท `localhost` ที่ไม่ใช่ secure context
  หรือประเด็น `SameSite='lax'` / cross-origin ระหว่าง `next start` fetch internal
- ไฟล์ที่เกี่ยวข้อง (คาดว่า): `src/lib/auth.ts` (setSessionCookie)
  - `cookieStore.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", ... })`
- บน localhost (http) WebKit มี policy อันเคร่งเรื่อง Secure cookie; `secure:true` เฉพาะ production
  ก็ยังอาจถูก block ในบางบริบทของ WebKit

### Suggested Fix (แนวทางสำหรับทีม Dev — ไม่ได้ implement)

1. ตรวจสอบว่า `Set-Cookie` response header จริงๆ ไปถึง browser ในกรณี WebKit (เพิ่ม `console.log` headers / ดู DevTools)
2. ทดลองปรับ cookie attributes:
   - แนใจว่า `secure: false` บน localhost (http) หรือใช้ `secure: process.env.NODE_ENV === "production"`
   - พิจารณา `sameSite: "lax"` → อาจปิดหรือลอง `"none"` บน dev
3. ถ้าเป็นปัญหาจาก internal fetch (server-fetch เรียกตัวเอง) — ลองให้ browser เรียก `/api/auth/login` ตรงๆ (ไม่ผ่าน proxy/fetch ฝั่ง server)
4. Fallback: ถ้า WebKit block httpOnly cookie จริง อาจต้องส่ง token ผ่าน header/cookie ที่ WebKit รองรับ หรือเปิด HTTPS บน dev
   (เช่น `next dev --experimental-https` หรือใช้ `localhost` ผ่าน tunnel)

### Impact

- ผู้ใช้ Safari/iOS ไม่สามารถ login/shopping ได้เลย → ส่งผลต่อยอดขายและ core user journey

---

## สรุปสถานะการทดสอบ

| บริษัท | Test ran | PASS | FAIL | Notes |
|---|---|---|---|---|
| Chromium | 21 | 21 | 0 | ทุก Flow ผ่าน |
| WebKit | 21 | 5 | 16 | เฉพาะที่ไม่ได้ login ผ่าน (storefront); ทุกอย่างที่ต้อง login ล้มเหลวจาก BUG-001 |

> หมายเหตุ: WebKit failed ทั้งหมดมาจาก root cause เดียว (BUG-001) — ไม่ใช่การทำงานผิดของแต่ละ feature
