"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBaht } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/types";

type StatsData = {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  statusCounts: { status: string; _count: number }[];
  lowStock: { id: string; name: string; slug: string; stock: number; imageUrl: string }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: keyof typeof ORDER_STATUS_LABELS;
    createdAt: string;
    user: { name: string };
  }[];
};

export default function AdminDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        return res.json();
      })
      .then((json) => setData(json.stats))
      .catch(() => setError("โหลดข้อมูลแดชบอร์ดไม่สำเร็จ"));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-stone-400">กำลังโหลด...</p>;

  const cards = [
    { label: "ยอดขายรวม", value: formatBaht(data.totalRevenue), icon: "💰" },
    { label: "คำสั่งซื้อทั้งหมด", value: data.totalOrders.toLocaleString("th-TH"), icon: "🧾" },
    { label: "สินค้าทั้งหมด", value: data.totalProducts.toLocaleString("th-TH"), icon: "📦" },
    { label: "ลูกค้าทั้งหมด", value: data.totalUsers.toLocaleString("th-TH"), icon: "👥" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-2xl">{card.icon}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-sm text-stone-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">คำสั่งซื้อล่าสุด</h2>
            <Link href="/admin/orders" className="text-sm text-orange-600 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentOrders.length === 0 && (
              <p className="text-sm text-stone-400">ยังไม่มีคำสั่งซื้อ</p>
            )}
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-stone-400">{order.user.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatBaht(order.total)}</p>
                  <span className="text-xs text-stone-500">
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Low stock */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-bold">สินค้าคงคลังใกล้หมด</h2>
          <div className="mt-4 space-y-3">
            {data.lowStock.length === 0 && (
              <p className="text-sm text-emerald-600">✅ สินค้าทุกชิ้นมีสต็อกเพียงพอ</p>
            )}
            {data.lowStock.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                <p className="flex-1 text-sm font-medium">{product.name}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    product.stock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  เหลือ {product.stock}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}