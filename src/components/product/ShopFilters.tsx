"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { Category } from "@/lib/types";

export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const updateUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const merged: Record<string, string | undefined> = {
        category: currentCategory,
        search: searchParams.get("search") ?? undefined,
        minPrice: searchParams.get("minPrice") ?? undefined,
        maxPrice: searchParams.get("maxPrice") ?? undefined,
        ...updates,
      };
      for (const [key, value] of Object.entries(merged)) {
        if (value) params.set(key, value);
      }
      router.push(`/shop?${params.toString()}`);
    },
    [router, currentCategory, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateUrl({ search: search.trim() || undefined, page: undefined });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5">
      <form onSubmit={handleSearchSubmit}>
        <label className="text-sm font-semibold">ค้นหาสินค้า</label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="พิมพ์ชื่อสินค้า..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-3 text-sm font-medium text-white hover:bg-stone-700"
          >
            ค้นหา
          </button>
        </div>
      </form>

      <div>
        <label className="text-sm font-semibold">หมวดหมู่</label>
        <div className="mt-2 space-y-1">
          <button
            type="button"
            onClick={() => updateUrl({ category: undefined, page: undefined })}
            className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-stone-50 ${
              !currentCategory ? "font-semibold text-orange-600" : "text-stone-600"
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateUrl({ category: cat.slug, page: undefined })}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-stone-50 ${
                currentCategory === cat.slug ? "font-semibold text-orange-600" : "text-stone-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">ช่วงราคา</label>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="ต่ำสุด"
            defaultValue={minPrice}
            onChange={(e) => {
              const value = e.target.value;
              const timer = setTimeout(() => updateUrl({ minPrice: value || undefined, page: undefined }), 500);
              return () => clearTimeout(timer);
            }}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          <span className="text-stone-400">-</span>
          <input
            type="number"
            min={0}
            placeholder="สูงสุด"
            defaultValue={maxPrice}
            onChange={(e) => {
              const value = e.target.value;
              const timer = setTimeout(() => updateUrl({ maxPrice: value || undefined, page: undefined }), 500);
              return () => clearTimeout(timer);
            }}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setSearch("");
          router.push("/shop");
        }}
        className="w-full rounded-lg border border-stone-300 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
      >
        ล้างตัวกรอง
      </button>
    </div>
  );
}