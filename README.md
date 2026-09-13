# 🛍️ ShopVerse — เว็บไซต์ขายของ (E-commerce)

เว็บไซต์ร้านค้าออนไลน์ครบวงจร สร้างด้วย **Next.js 16 (App Router) Fullstack REST API + PostgreSQL**

## ✨ ฟีเจอร์หลัก

- **ร้านค้า** — หน้าแรก, หน้ารวมสินค้า `(/shop)` พร้อมค้นหา / กรองหมวดหมู่ / กรองราคา / เปลี่ยนหน้า, หน้าสินค้า `(/product/[slug])`
- **ตะกร้าสินค้า** — เพิ่ม/ลด/ลบสินค้า แสดงจำนวนบน header แบบเรียลไทม์
- **ชำระเงิน (Checkout)** — ระบุที่อยู่จัดส่ง, เลือกวิธีชำระ (เก็บเงินปลายทาง / โอน / บัตร), ค่าจัดส่งอัตโนมัติ (ฟรีเมื่อยอด ≥ 1,000 บาท), ตัดสต็อก, สร้างเลขคำสั่งซื้อ
- **คำสั่งซื้อ** — ประวัติคำสั่งซื้อ, ดูรายละเอียด, ติดตามสถานะ
- **รีวิวสินค้า** — รีวิวเฉพาะลูกค้าที่ซื้อสินค้าจริง (ตรวจสอบจากคำสั่งซื้อ)
- **ระบบสมาชิก** — สมัคร/เข้าสู่ระบบด้วย JWT (httpOnly cookie) + bcrypt
- **แผงผู้ดูแลระบบ `(/admin)`** — แดชบอร์ด (ยอดขาย/สถิติ), จัดการสินค้า (เพิ่ม/แก้ไข/ซ่อน/ลบ), จัดการคำสั่งซื้อ (เปลี่ยนสถานะ)

## 🧱 เทคโนโลยี

| ส่วน | เทคโนโลยี |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Backend | REST API Route Handlers (`src/app/api/**`) |
| ภาษา | TypeScript |
| ฐานข้อมูล | PostgreSQL 16 |
| ORM | Prisma 6 |
| UI | Tailwind CSS 4 |
| Auth | JWT (jose) + bcryptjs, httpOnly cookie |

## 🚀 เริ่มต้นใช้งาน

### ข้อกำหนดเบื้องต้น
- Node.js 20+
- ฐานข้อมูล PostgreSQL — ใช้ **Neon** (คลาวด์) ได้เลย

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า environment variables

สร้างไฟล์ `.env.local` (จำเป็น — Next.js โหลด `.env.local` ให้อัตโนมัติส่วน Prisma CLI ใช้ผ่าน `dotenv -e .env.local`):

```bash
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

แก้ไขไฟล์ `.env.local` (ตัวอย่างใช้ฐานข้อมูล **Neon** บนคลาวด์):

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"
AUTH_SECRET="เปลี่ยนเป็น secret ของคุณ"
```

> ⚠️ `.env.local` มีข้อมูลลับ ถูก ignore ไว้ไม่ให้ commit ขึ้น git (ดู `.gitignore`)
> ⚠️ ห้ามอ่าน `DATABASE_URL` ใน Client Components — Prisma ใช้ได้เฉพาะใน Server Components / Route Handlers เท่านั้น

### 3. รัน migration และ seed ข้อมูลตัวอย่าง

```bash
npm run db:deploy    # prisma migrate deploy (กับฐานข้อมูลที่ตั้งไว้ใน .env.local)
npm run db:seed      # ใส่ข้อมูลตัวอย่าง (admin + สินค้า 10 รายการ)
```

> ถ้าใช้ฐานข้อมูล PostgreSQL ที่อื่น ให้เปลี่ยน `DATABASE_URL` ใน `.env.local` ให้ตรงกับฐานข้อมูลของคุณ

### 4. เริ่มเซิร์ฟเวอร์

```bash
npm run dev   # → http://localhost:3000
```

## 🔑 บัญชีทดลอง (จาก seed)

| บทบาท | อีเมล | รหัสผ่าน |
|---|---|---|
| ผู้ดูแลระบบ | `admin@shop.com` | `admin123` |
| ลูกค้า | `customer@shop.com` | `customer123` |

## 📡 REST API

| Method | Path | คำอธิบาย | สิทธิ์ |
|---|---|---|---|
| POST | `/api/auth/register` | สมัครสมาชิก | ทุกคน |
| POST | `/api/auth/login` | เข้าสู่ระบบ (set cookie) | ทุกคน |
| POST | `/api/auth/logout` | ออกจากระบบ | ทุกคน |
| GET | `/api/auth/me` | ข้อมูลผู้ใช้ปัจจุบัน | Login |
| GET | `/api/products` | รายการสินค้า (filter: `category`, `search`, `minPrice`, `maxPrice`, `page`, `pageSize`, `all=1` แสดงสินค้าที่ซ่อน) | ทุกคน |
| GET | `/api/products/[slug]` | รายละเอียดสินค้า + รีวิว | ทุกคน |
| POST | `/api/products` | เพิ่มสินค้า | Admin |
| PUT/DELETE | `/api/products/[slug]` | แก้ไข/ลบสินค้า | Admin |
| POST | `/api/products/[slug]/reviews` | รีวิวสินค้า (ต้องเคยซื้อ) | Login |
| GET/POST | `/api/categories` | หมวดหมู่ / เพิ่มหมวดหมู่ | GET: ทุกคน, POST: Admin |
| PUT/DELETE | `/api/categories/[id]` | แก้ไข/ลบหมวดหมู่ | Admin |
| GET/POST | `/api/cart` | ดูตะกร้า / เพิ่มสินค้า | Login |
| PATCH/DELETE | `/api/cart/[productId]` | เปลี่ยนจำนวน / ลบสินค้า | Login |
| POST | `/api/orders` | สร้างคำสั่งซื้อ (checkout) | Login |
| GET | `/api/orders` | ประวัติคำสั่งซื้อ (`?scope=all` สำหรับ admin) | Login / Admin |
| GET | `/api/orders/[id]` | รายละเอียดคำสั่งซื้อ | เจ้าของ / Admin |
| PATCH | `/api/orders` | อัปเดตสถานะคำสั่งซื้อ (`orderId`, `status`) | Admin |
| GET | `/api/admin/stats` | สถิติแดชบอร์ด | Admin |

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── api/                    # REST API (Route Handlers)
│   │   ├── auth/               # register, login, logout, me
│   │   ├── products/           # CRUD + reviews + filter/search
│   │   ├── categories/         # CRUD
│   │   ├── cart/               # get/add/update/remove
│   │   ├── orders/             # checkout + history + admin status
│   │   └── admin/stats/        # dashboard stats
│   ├── (page)/                 # หน้าเว็บ
│   ├── cart/page.tsx           # ตะกร้าสินค้า
│   ├── checkout/page.tsx       # ชำระเงิน
│   ├── account/                # บัญชี + คำสั่งซื้อ
│   ├── admin/                  # แผงแอดมิน (dashboard, products, orders)
│   └── layout.tsx              # Root layout (Header/Footer/CartProvider)
├── components/                 # UI components (client)
├── lib/
│   ├── auth.ts                 # JWT session
│   ├── prisma.ts               # Prisma client (singleton)
│   ├── server-fetch.ts         # SSR fetch เรียก REST API ตัวเอง พร้อม cookie
│   └── validations/            # Zod schemas
prisma/
├── schema.prisma               # ฐานข้อมูล (User, Product, Category, Cart, Order, Review...)
├── seed.ts                     # ข้อมูลตัวอย่าง
└── migrations/                 # Prisma migrations
e2e/                            # Playwright E2E tests
├── helpers/auth.ts             # login/register helper + seed accounts
├── store.spec.ts               # หน้าแรก / shop / product
├── auth.spec.ts                # สมัคร/เข้าสู่ระบบ/ออกจากระบบ
├── cart.spec.ts                # ตะกร้า: เพิ่ม/แก้จำนวน/ลบ
├── checkout.spec.ts            # ชำระเงิน + validation
└── admin.spec.ts               # แผงแอดมิน + สิทธิ์
```

## 🤖 Automated Testing ด้วย Playwright

เทสต์ E2E จำลองผู้ใช้จริงคลิกใช้งานเว็บ (UI-level) ครอบคลุมหน้าแรก, ค้นหา/กรองสินค้า, สมัคร/เข้าสู่ระบบ, ตะกร้า, สั่งซื้อ และแผงแอดมิน

### ติดตั้ง browser (ครั้งแรก)

```bash
npm run test:e2e:install
```

### รันเทสต์ทั้งหมด

```bash
npm run test:e2e
```

> `webServer` ใน `playwright.config.ts` จะเปิด `npm run dev` ให้อัตโนมัติ (พอร์ต 3000) — ไม่ต้องรันเอง

### คำสั่งอื่นๆ

```bash
npm run test:e2e:ui       # เปิด UI mode (ดู step-by-step)
npm run test:e2e:headed   # รันแบบเห็น browser
npx playwright test e2e/store.spec.ts   # รันเฉพาะไฟล์
```

### หลักการที่ใช้

- **ไม่เช็ตอัพผ่าน API** — login/register ผ่าน UI จริง เพื่อทดสอบ user journey
- **แต่ละเทสต์ใช้ user ใหม่** (สมัครสด) ในตะกร้า/checkout เพื่อไม่ให้ชนกันตอน parallel
- **รอ element ผ่าน auto-wait** (`expect(...).toBeVisible()`) แทน sleep
- รายงาน HTML เก็บที่ `playwright-report/` — เปิดได้ด้วย `npx playwright show-report`

## 🧪 คำสั่งที่มีประโยชน์

```bash
npm run dev              # dev server
npm run build            # production build
npm run lint             # ESLint
npm run db:seed          # seed ข้อมูลตัวอย่าง
npm run db:deploy        # รัน migration กับฐานข้อมูลจริง
npm run db:migrate       # สร้าง migration ใหม่ (โหมด dev)
npm run db:studio        # Prisma Studio (ดูข้อมูลใน DB)
npm run test:e2e        # รัน Playwright tests
npm run test:e2e:ui      # Playwright UI mode
```