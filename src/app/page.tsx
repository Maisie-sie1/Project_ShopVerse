import Link from "next/link";
import { apiFetch } from "@/lib/server-fetch";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [prodRes, catRes] = await Promise.all([
      apiFetch<{ products: Product[] }>("/api/products?pageSize=8"),
      apiFetch<{ categories: Category[] }>("/api/categories"),
    ]);
    products = prodRes.products;
    categories = catRes.categories;
  } catch (error) {
    console.error("Failed to load home data:", error);
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
              ร้านค้าออนไลน์ #1 ของไทย
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              ของดีราคาดี
              <br />
              ส่งไวถึงบ้านคุณ
            </h1>
            <p className="mt-5 max-w-md text-lg text-stone-300">
              เลือกช้อปสินค้าคุณภาพจากหมวดหมู่หลากหลาย สั่งง่าย จ่ายสะดวก
              จัดส่งทั่วประเทศภายใน 1-3 วัน
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-orange-600 px-7 py-3 font-semibold text-white transition hover:bg-orange-500"
              >
                เริ่มช้อปปิ้ง
              </Link>
              <Link
                href="/shop?category=electronics"
                className="rounded-full border border-white/25 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                ดูสินค้ามาแรง
              </Link>
            </div>
          </div>
          <div className="hidden justify-end md:flex">
            <div className="grid h-72 w-72 place-items-center rounded-3xl bg-white/5 text-[120px]">
              🛍️
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">หมวดหมู่สินค้า</h2>
          <Link href="/shop" className="text-sm font-medium text-orange-600 hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-orange-300 hover:shadow-md"
            >
              <div className="text-3xl">🛒</div>
              <p className="mt-3 font-semibold group-hover:text-orange-600">{cat.name}</p>
              <p className="text-xs text-stone-400">{cat._count?.products ?? 0} สินค้า</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">สินค้าแนะนำ</h2>
          <Link href="/shop" className="text-sm font-medium text-orange-600 hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="mt-8 text-center text-stone-500">
            ยังไม่มีสินค้า — รัน <code className="rounded bg-stone-100 px-1.5 py-0.5">npm run db:seed</code> เพื่อเพิ่มข้อมูลตัวอย่าง
          </p>
        )}
      </section>
    </div>
  );
}