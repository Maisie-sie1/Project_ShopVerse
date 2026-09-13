import { test, expect } from "@playwright/test";
import { SEED, API, newUserContext } from "./helpers";

/** API-01: Authentication */
test.describe("API — Auth", () => {
  test("API-AUTH-001: register สำเร็จ → 201 + user + cookie session", async ({ request }) => {
    const email = `api_${Date.now()}@test.com`;
    const res = await request.post(API.register, {
      data: { name: "Test", email, password: "secret123" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe(email);
    expect(body.user.role).toBe("CUSTOMER");
    expect(body.user.passwordHash).toBeUndefined(); // ไม่ leak password hash
  });

  test("API-AUTH-002: register email ซ้ำ → 409", async ({ request }) => {
    const res = await request.post(API.register, {
      data: { name: "Dup", email: SEED.customer.email, password: "secret123" },
    });
    expect(res.status()).toBe(409);
  });

  test("API-AUTH-003: register ข้อมูลไม่ถูกต้อง → 422", async ({ request }) => {
    const res = await request.post(API.register, {
      data: { name: "", email: "not-an-email", password: "123" },
    });
    expect(res.status()).toBe(422);
  });

  test("API-AUTH-004: login สำเร็จ → 200 + user", async ({ request }) => {
    const res = await request.post(API.login, {
      data: { email: SEED.customer.email, password: SEED.customer.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe(SEED.customer.email);
    expect(body.user.role).toBe("CUSTOMER");
  });

  test("API-AUTH-005: login รหัสผิด → 401", async ({ request }) => {
    const res = await request.post(API.login, {
      data: { email: SEED.customer.email, password: "wrongpass" },
    });
    expect(res.status()).toBe(401);
  });

  test("API-AUTH-006: /api/auth/me ไม่มี session → user null (200)", async ({ request }) => {
    const res = await request.get(API.me);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user).toBeNull();
  });

  test("API-AUTH-007: login แล้ว me คืน user ปัจจุบัน", async ({ request }) => {
    // use request fixture ที่มี cookie จากการ login ใน test นี้
    const login = await request.post(API.login, {
      data: { email: SEED.customer.email, password: SEED.customer.password },
    });
    expect(login.status()).toBe(200);
    const me = await request.get(API.me);
    expect(me.status()).toBe(200);
    const body = await me.json();
    expect(body.user.email).toBe(SEED.customer.email);
  });

  test("API-AUTH-008: logout แล้ว me เป็น null", async ({ request }) => {
    await request.post(API.login, {
      data: { email: SEED.customer.email, password: SEED.customer.password },
    });
    await request.post(API.logout);
    const me = await request.get(API.me);
    const body = await me.json();
    expect(body.user).toBeNull();
  });

  test("API-AUTH-009: login ผ่านหน้าแรกของ context เก็บ cookie (RBAC base)", async () => {
    const { ctx } = await newUserContext();
    const me = await ctx.get(API.me);
    const body = await me.json();
    expect(body.user).not.toBeNull();
    expect(body.user.role).toBe("CUSTOMER");
    await ctx.dispose();
  });
});
