import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">บัญชีของฉัน</h1>
      <p className="mt-1 text-stone-500">จัดการข้อมูลและติดตามคำสั่งซื้อของคุณ</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-3xl">👤</p>
          <h2 className="mt-3 font-bold">โปรไฟล์</h2>
          <p className="mt-1 break-all text-sm text-stone-500">{user.name}</p>
          <p className="break-all text-sm text-stone-400">{user.email}</p>
        </div>
        <Link
          href="/account/orders"
          className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-md"
        >
          <p className="text-3xl">📦</p>
          <h2 className="mt-3 font-bold">คำสั่งซื้อของฉัน</h2>
          <p className="mt-1 text-sm text-stone-500">ดูรายการสั่งซื้อ ติดตามสถานะ</p>
        </Link>
        <Link
          href="/shop"
          className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-md"
        >
          <p className="text-3xl">🛍️</p>
          <h2 className="mt-3 font-bold">ช้อปปิ้งต่อ</h2>
          <p className="mt-1 text-sm text-stone-500">เลือกซื้อสินค้าใหม่เพิ่มเติม</p>
        </Link>
      </div>
    </div>
  );
}