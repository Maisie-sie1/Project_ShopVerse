import { Suspense } from "react";
import { apiFetch } from "@/lib/server-fetch";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopFilters } from "@/components/product/ShopFilters";
import { Pagination } from "@/components/ui/Pagination";
import type { Product, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

async function getShopData(searchParams: Awaited<ShopPageProps["searchParams"]>) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.page) params.set("page", searchParams.page);
  if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
  params.set("pageSize", "12");

  const [prodRes, catRes] = await Promise.all([
    apiFetch<{ products: Product[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }>(
      `/api/products?${params.toString()}`
    ),
    apiFetch<{ categories: Category[] }>("/api/categories"),
  ]);

  return { ...prodRes, categories: catRes.categories };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolved = await searchParams;
  const { products, pagination, categories } = await getShopData(resolved);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">สินค้าทั้งหมด</h1>
          <p className="mt-1 text-sm text-stone-500">พบสินค้าทั้งหมด {pagination.total} รายการ</p>
        </div>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        <aside className="mb-6 lg:mb-0">
          <ShopFilters categories={categories} />
        </aside>

        <div>
          <Suspense fallback={<div className="py-20 text-center text-stone-400">กำลังโหลดสินค้า...</div>}>
            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 py-24 text-center">
                <p className="text-4xl">🔍</p>
                <p className="mt-3 font-medium text-stone-600">ไม่พบสินค้าที่ค้นหา</p>
                <p className="mt-1 text-sm text-stone-400">ลองเปลี่ยนคำค้นหรือหมวดหมู่</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </Suspense>

          {pagination.totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                basePath="/shop"
                params={resolved}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}