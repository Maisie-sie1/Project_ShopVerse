import { redirect } from "next/navigation";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { getSessionUser } from "@/lib/auth";
import { apiFetch } from "@/lib/server-fetch";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/orders");

  let orders: Order[] = [];
  try {
    const res = await apiFetch<{ orders: Order[] }>("/api/orders?scope=all");
    orders = res.orders;
  } catch (error) {
    console.error("Failed to load admin orders:", error);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">จัดการคำสั่งซื้อ</h2>
        <p className="text-sm text-stone-500">ทั้งหมด {orders.length} รายการ</p>
      </div>
      <div className="mt-6">
        <AdminOrdersTable orders={orders} />
      </div>
    </div>
  );
}