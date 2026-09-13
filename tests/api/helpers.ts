import { request, expect, type APIRequestContext } from "@playwright/test";

/** Seed accounts (จาก prisma/seed.ts) */
export const SEED = {
  admin: { email: "admin@shop.com", password: "admin123" },
  customer: { email: "customer@shop.com", password: "customer123" },
} as const;

export const API = {
  register: "/api/auth/register",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  me: "/api/auth/me",
  products: "/api/products",
  categories: "/api/categories",
  cart: "/api/cart",
  orders: "/api/orders",
  adminStats: "/api/admin/stats",
} as const;

/** สร้าง APIRequestContext ที่ login ด้วยบัญชีที่กำหนด (เก็บ session cookie) */
export async function authedContext(
  { email, password }: { email: string; password: string },
  baseURL = "http://localhost:3000"
): Promise<APIRequestContext> {
  const ctx = await request.newContext({ baseURL });
  const res = await ctx.post(API.login, { data: { email, password } });
  expect(res.status()).toBe(200);
  return ctx;
}

/** สมัคร user ใหม่ผ่าน API และคืน context ที่ login แล้ว + email */
export async function newUserContext(
  baseURL = "http://localhost:3000"
): Promise<{ ctx: APIRequestContext; email: string }> {
  const email = `api_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
  const ctx = await request.newContext({ baseURL });
  const res = await ctx.post(API.register, {
    data: { name: "API Tester", email, password: "secret123" },
  });
  expect(res.status()).toBe(201);
  return { ctx, email };
}
