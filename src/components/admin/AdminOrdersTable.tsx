"use client";

import type { Order } from "@/lib/types";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ALL_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

type OrderListProps = {
  orders: Order[];
};

export function AdminOrdersTable({ orders }: OrderListProps) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-stone-500">
          <tr>
            <th className="px-4 py-3">เลขที่สั่งซื้อ</th>
            <th className="px-4 py-3">ลูกค้า</th>
            <th className="px-4 py-3">ชำระเงิน</th>
            <th className="px-4 py-3 text-right">ยอดรวม</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3 text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-stone-400">
                ยังไม่มีคำสั่งซื้อ
              </td>
            </tr>
          )}
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-stone-50">
              <td className="px-4 py-3">
                <Link href={`/account/orders/${order.id}`} className="font-medium hover:text-orange-600">
                  {order.orderNumber}
                </Link>
                <p className="text-xs text-stone-400">
                  {new Date(order.createdAt).toLocaleDateString("th-TH")}
                </p>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{order.user?.name}</p>
                <p className="text-xs text-stone-400">{order.user?.email}</p>
              </td>
              <td className="px-4 py-3 text-stone-500">
                {order.payments[0]
                  ? PAYMENT_METHOD_LABELS[
                      order.payments[0].method as keyof typeof PAYMENT_METHOD_LABELS
                    ] ?? order.payments[0].method
                  : "-"}
              </td>
              <td className="px-4 py-3 text-right font-bold">{order.total.toLocaleString("th-TH", { style: "currency", currency: "THB" })}</td>
              <td className="px-4 py-3">
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className={`rounded-full border-0 px-3 py-1 text-xs font-semibold outline-none ring-1 ring-inset ${
                    order.status === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : order.status === "CANCELLED"
                      ? "bg-red-50 text-red-600 ring-red-200"
                      : order.status === "PENDING"
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : "bg-blue-50 text-blue-700 ring-blue-200"
                  }`}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="rounded-lg border border-stone-200 px-3 py-1 text-xs font-medium hover:bg-stone-100"
                >
                  ดูรายละเอียด
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}