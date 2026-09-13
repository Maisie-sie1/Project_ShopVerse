import { test, expect } from "@playwright/test";
import { SEED, API, authedContext, newUserContext } from "./helpers";

/** API-03: Cart, Orders, Admin/RBAC — ใช้ context ที่ login แล้ว (ไม่ต้องพึ่ง browser cookie) */
test.describe("API — Cart", () => {
  test("API-CART-001: ไม่ login → 401", async ({ request }) => {
    const res = await request.get(API.cart);
    expect(res.status()).toBe(401);
  });

  test("API-CART-002: เพิ่มสินค้า → 200 + badge count", async () => {
    const { ctx } = await newUserContext();
    const list = await (await ctx.get(`${API.products}?pageSize=1`)).json();
    const productId = list.products[0].id;

    const res = await ctx.post(API.cart, { data: { productId, quantity: 2 } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.itemCount).toBe(2);

    // GET cart มี item
    const cart = await (await ctx.get(API.cart)).json();
    expect(cart.cart.items.length).toBe(1);
    expect(cart.cart.itemCount).toBe(2);
    expect(cart.cart.items[0].productId).toBe(productId);
    await ctx.dispose();
  });

  test("API-CART-003: เพิ่มจำนวนเกินสต็อก → 422", async () => {
    const { ctx } = await newUserContext();
    const list = await (await ctx.get(`${API.products}?pageSize=1`)).json();
    const p = list.products[0];
    const res = await ctx.post(API.cart, {
      data: { productId: p.id, quantity: p.stock + 100 },
    });
    expect(res.status()).toBe(422);
    await ctx.dispose();
  });

  test("API-CART-004: PATCH เปลี่ยนจำนวน → 200", async () => {
    const { ctx } = await newUserContext();
    const list = await (await ctx.get(`${API.products}?pageSize=1`)).json();
    const p = list.products[0];
    await ctx.post(API.cart, { data: { productId: p.id, quantity: 1 } });
    const res = await ctx.patch(`${API.cart}/${p.id}`, { data: { quantity: 3 } });
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });

  test("API-CART-005: DELETE item → 200 แล้ว cart ว่าง", async () => {
    const { ctx } = await newUserContext();
    const list = await (await ctx.get(`${API.products}?pageSize=1`)).json();
    const p = list.products[0];
    await ctx.post(API.cart, { data: { productId: p.id, quantity: 1 } });
    const res = await ctx.delete(`${API.cart}/${p.id}`);
    expect(res.status()).toBe(200);
    const cart = await (await ctx.get(API.cart)).json();
    expect(cart.cart.items.length).toBe(0);
    await ctx.dispose();
  });
});

test.describe("API — Orders (Checkout)", () => {
  test("API-ORD-001: checkout ว่าง (ไม่ login) → 401", async ({ request }) => {
    const res = await request.post(API.orders, { data: {} });
    expect(res.status()).toBe(401);
  });

  test("API-ORD-002: checkout สำเร็จ → 201 + order number + ลด stock", async () => {
    const { ctx } = await newUserContext();
    const list = await (await ctx.get(`${API.products}?pageSize=1`)).json();
    const p = list.products[0];
    const stockBefore = p.stock;

    await ctx.post(API.cart, { data: { productId: p.id, quantity: 1 } });
    const res = await ctx.post(API.orders, {
      data: {
        address: {
          fullName: "API Tester",
          phone: "0812345678",
          line1: "1/1 Test Rd",
          city: "Bangkok",
          state: "Bangkok",
          postalCode: "10110",
          country: "Thailand",
        },
        paymentMethod: "CASH_ON_DELIVERY",
        saveAddress: false,
      },
    });
    expect(res.status()).toBe(201);
    const { order } = await res.json();
    expect(order.orderNumber).toMatch(/^ORD-/);
    expect(order.status).toBe("PENDING");
    expect(order.total).toBeGreaterThan(0);
    // stock ลดลง 1
    const after = await (await ctx.get(`${API.products}/${p.slug}`)).json();
    expect(Number(after.product.stock)).toBe(stockBefore - 1);
    await ctx.dispose();
  });

  test("API-ORD-003: checkout ไม่ login / ไม่มี body → 401 (validation ลำดับแรก)", async ({ request }) => {
    const res = await request.post(API.orders, { data: {} });
    expect(res.status()).toBe(401); // requireUser มาก่อน
  });

  test("API-ORD-003b: checkout body ไม่ valid → 422 (Zod ฟอร์ม)", async () => {
    const { ctx } = await newUserContext();
    const res = await ctx.post(API.orders, { data: { address: {}, paymentMethod: "CARD" } });
    expect(res.status()).toBe(422);
    await ctx.dispose();
  });

  test("API-ORD-004: GET /api/orders (user) → เห็นเฉพาะของตัวเอง", async () => {
    // user A มี order
    const { ctx } = await newUserContext();
    const list = await (await ctx.get(`${API.products}?pageSize=1`)).json();
    const p = list.products[0];
    await ctx.post(API.cart, { data: { productId: p.id, quantity: 1 } });
    const orderRes = await ctx.post(API.orders, {
      data: {
        address: { fullName: "User A", phone: "0812345678", line1: "1/1 Test", city: "BKK", state: "BKK", postalCode: "10110", country: "Thailand" },
        paymentMethod: "CASH_ON_DELIVERY",
        saveAddress: false,
      },
    });
    expect(orderRes.status()).toBe(201); // ยืนยันว่าสร้าง order จริง
    const orders = await (await ctx.get(API.orders)).json();
    expect(orders.orders.length).toBe(1);
    await ctx.dispose();

    // user B ไม่เห็น order ของ A
    const { ctx: ctxB } = await newUserContext();
    const ordersB = await (await ctxB.get(API.orders)).json();
    expect(ordersB.orders.length).toBe(0);
    await ctxB.dispose();
  });
});

test.describe("API — Orders status (Admin only)", () => {
  test("API-ADM-001: PATCH order status ไม่มี session → 401", async ({ request }) => {
    const res = await request.patch(API.orders, {
      data: { orderId: "fake", status: "PROCESSING" },
    });
    expect(res.status()).toBe(401);
  });

  test("API-ADM-001b: PATCH order status เป็น customer → 403", async () => {
    const ctx = await authedContext(SEED.customer);
    const res = await ctx.patch(API.orders, {
      data: { orderId: "fake", status: "PROCESSING" },
    });
    expect(res.status()).toBe(403);
    await ctx.dispose();
  });

  test("API-ADM-002: status ไม่ valid → 422", async () => {
    const ctx = await authedContext(SEED.admin);
    const res = await ctx.patch(API.orders, { data: { orderId: "x", status: "BAD" } });
    expect(res.status()).toBe(422);
    await ctx.dispose();
  });

  test("API-ADM-003: GET /api/orders?scope=all → admin เห็นทั้งหมด", async () => {
    const ctx = await authedContext(SEED.admin);
    const res = await ctx.get(`${API.orders}?scope=all`);
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });
});

test.describe("API — Admin stats (RBAC)", () => {
  test("API-ADM-004: /api/admin/stats ไม่ login → 401", async ({ request }) => {
    const res = await request.get(API.adminStats);
    expect(res.status()).toBe(401);
  });

  test("API-ADM-005: /api/admin/stats เป็น customer → 403", async () => {
    const ctx = await authedContext(SEED.customer);
    const res = await ctx.get(API.adminStats);
    expect(res.status()).toBe(403);
    await ctx.dispose();
  });

  test("API-ADM-006: /api/admin/stats เป็น admin → 200 + stats", async () => {
    const ctx = await authedContext(SEED.admin);
    const res = await ctx.get(API.adminStats);
    expect(res.status()).toBe(200);
    const { stats } = await res.json();
    expect(typeof stats.totalProducts).toBe("number");
    expect(typeof stats.totalOrders).toBe("number");
    expect(typeof stats.totalRevenue).toBe("number");
    expect(Array.isArray(stats.statusCounts)).toBe(true);
    await ctx.dispose();
  });
});
