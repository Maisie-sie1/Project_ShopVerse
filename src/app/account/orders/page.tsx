import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { apiFetch } from "@/lib/server-fetch";
import { formatBaht } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/types";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/orders");

  let orders: Order[] = [];
  try {
    const res = await apiFetch<{ orders: Order[] }>("/api/orders");
    orders = res.orders;
  } catch (error) {
    console.error("Failed to load orders:", error);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">คำสั่งซื้อของฉัน</h1>
          <p className="mt-1 text-stone-500">ทั้งหมด {orders.length} รายการ</p>
        </div>
        <Link
          href="/shop"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          สั่งซื้อเพิ่ม
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 py-20 text-center">
          <p className="text-4xl">📦</p>
          <p className="mt-3 font-medium text-stone-600">ยังไม่มีคำสั่งซื้อ</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-orange-300 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">
                    {order.orderNumber}
                    <span className="ml-2 text-sm font-normal text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} รายการ
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-600"
                        : order.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <p className="mt-1 font-bold text-orange-600">{formatBaht(order.total)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}