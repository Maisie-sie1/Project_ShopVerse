"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatBaht } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const pathname = usePathname();

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("pageSize", "50");
    params.set("all", "1");
    try {
      const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.products);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    // re-fetch เมื่อกลับมาที่หน้านี้ (เช่น หลังเพิ่ม/แก้ไขสินค้าในหน้า form แล้ว redirect กลับมา)
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load, pathname]);

  async function toggleActive(product: Product) {
    await fetch(`/api/products/${product.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    load();
  }

  async function handleDelete(slug: string) {
    if (!confirm("ยืนยันการลบสินค้าชิ้นนี้?")) return;
    setDeleting(slug);
    try {
      await fetch(`/api/products/${slug}`, { method: "DELETE" });
      load();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาสินค้า..."
          className="w-full max-w-xs rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
        <Link
          href="/admin/products/new"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          + เพิ่มสินค้า
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {loading ? (
          <p className="p-8 text-center text-stone-400">กำลังโหลด...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">สินค้า</th>
                <th className="px-4 py-3">หมวดหมู่</th>
                <th className="px-4 py-3 text-right">ราคา</th>
                <th className="px-4 py-3 text-center">สต็อก</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <span className="max-w-[220px] truncate font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{product.category?.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatBaht(product.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        product.stock === 0
                          ? "bg-red-100 text-red-600"
                          : product.stock <= 5
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleActive(product)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
                        product.isActive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-stone-200 text-stone-500 hover:bg-stone-300"
                      }`}
                    >
                      {product.isActive ? "แสดง" : "ซ่อน"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.slug}/edit`}
                        className="rounded-lg border border-stone-200 px-3 py-1 text-xs font-medium hover:bg-stone-100"
                      >
                        แก้ไข
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.slug)}
                        disabled={deleting === product.slug}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}