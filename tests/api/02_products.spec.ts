import { test, expect } from "@playwright/test";
import { SEED, API, authedContext } from "./helpers";

/** API-02: Products & Categories */
test.describe("API — Products", () => {
  test("API-PRD-001: GET /api/products → 200 + รายการ + pagination", async ({ request }) => {
    const res = await request.get(`${API.products}?pageSize=5`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.pageSize).toBe(5);
    expect(body.pagination.total).toBeGreaterThan(0);
    // product มี field ครบ
    const p = body.products[0];
    expect(typeof p.name).toBe("string");
    expect(typeof p.price).toBe("string"); // Decimal → string
  });

  test("API-PRD-002: filter หมวดหมู่ drinks", async ({ request }) => {
    const res = await request.get(`${API.products}?category=drinks`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBeGreaterThan(0);
    for (const p of body.products) {
      expect(p.category.slug).toBe("drinks");
    }
  });

  test("API-PRD-003: search=กาแฟ คืนสินค้าที่ชื่อมีคำว่า กาแฟ", async ({ request }) => {
    const res = await request.get(`${API.products}?search=${encodeURIComponent("กาแฟ")}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBeGreaterThan(0);
    for (const p of body.products) {
      expect(p.name).toContain("กาแฟ");
    }
  });

  test("API-PRD-004: minPrice/maxPrice กรองราคา", async ({ request }) => {
    const res = await request.get(`${API.products}?minPrice=100&maxPrice=500&pageSize=50`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const p of body.products) {
      const price = Number(p.price);
      expect(price).toBeGreaterThanOrEqual(100);
      expect(price).toBeLessThanOrEqual(500);
    }
  });

  test("API-PRD-005: GET product by slug → 200 + reviews", async ({ request }) => {
    // หา product ก่อน
    const list = await request.get(`${API.products}?pageSize=1`);
    const { products } = await list.json();
    const slug = products[0].slug;
    const res = await request.get(`${API.products}/${slug}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.product.slug).toBe(slug);
    expect(Array.isArray(body.product.reviews)).toBe(true);
  });

  test("API-PRD-006: GET product ไม่มี → 404", async ({ request }) => {
    const res = await request.get(`${API.products}/does-not-exist-xyz`);
    expect(res.status()).toBe(404);
  });

  test("API-PRD-007: POST /api/products ไม่มี session → 401", async ({ request }) => {
    const res = await request.post(API.products, {
      data: { name: "x", description: "y", price: 1, imageUrl: "https://x.com/i.png" },
    });
    expect(res.status()).toBe(401);
  });

  test("API-PRD-008: POST /api/products เป็น admin ก่อนแล้วค่อย POST → สำเร็จ 201", async () => {
    const ctx = await authedContext(SEED.admin);
    const res = await ctx.post(API.products, {
      data: {
        name: `สินค้า API ${Date.now()}`,
        description: "สินค้าที่สร้างผ่าน API test 1234567890",
        price: 199,
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
        stock: 5,
        categoryId: (await (await ctx.get(API.categories)).json()).categories[0].id,
      },
    });
    expect(res.status()).toBe(201);
    await ctx.dispose();
  });

  test("API-PRD-010: POST /api/products เป็น customer → 403", async () => {
    const ctx = await authedContext(SEED.customer);
    const res = await ctx.post(API.products, {
      data: { name: "x", description: "y", price: 1, imageUrl: "https://x.com/i.png" },
    });
    expect(res.status()).toBe(403);
    await ctx.dispose();
  });

  test("API-PRD-009: POST product ข้อมูลไม่ valid (ราคา 0) → 422", async () => {
    const ctx = await authedContext(SEED.admin);
    const res = await ctx.post(API.products, {
      data: {
        name: "Bad Product",
        description: "desc",
        price: 0,
        imageUrl: "https://x.com/i.png",
        stock: 1,
      },
    });
    expect(res.status()).toBe(422);
    await ctx.dispose();
  });
});

test.describe("API — Categories", () => {
  test("API-CAT-001: GET /api/categories → 200 + รายการ", async ({ request }) => {
    const res = await request.get(API.categories);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.categories.length).toBeGreaterThan(0);
  });

  test("API-CAT-002: POST /api/categories ไม่มี session → 401", async ({ request }) => {
    const res = await request.post(API.categories, { data: { name: "ใหม่" } });
    expect(res.status()).toBe(401);
  });

  test("API-CAT-002b: POST /api/categories เป็น customer → 403", async () => {
    const ctx = await authedContext(SEED.customer);
    const res = await ctx.post(API.categories, { data: { name: "ใหม่" } });
    expect(res.status()).toBe(403);
    await ctx.dispose();
  });

  test("API-CAT-003: POST /api/categories เป็น admin → 201 (ชื่อซ้ำ 409)", async () => {
    const ctx = await authedContext(SEED.admin);
    const name = `หมวด ${Date.now()}`;
    const created = await ctx.post(API.categories, { data: { name } });
    expect(created.status()).toBe(201);
    const dup = await ctx.post(API.categories, { data: { name } });
    expect(dup.status()).toBe(409);
    await ctx.dispose();
  });
});