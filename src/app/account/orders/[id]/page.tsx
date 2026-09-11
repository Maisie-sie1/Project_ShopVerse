import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { apiFetch } from "@/lib/server-fetch";
import { formatBaht } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/types";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

type OrderDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/account/orders/${(await params).id}`);

  const { id } = await params;

  let order: Order | null = null;
  try {
    const res = await apiFetch<{ order: Order }>(`/api/orders/${id}`);
    order = res.order;
  } catch {
    notFound();
  }

  const payment = order.payments[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/account/orders" className="text-sm text-stone-500 hover:text-stone-900">
        ← กลับไปรายการคำสั่งซื้อ
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-stone-500">
            สั่งซื้อเมื่อ{" "}
            {new Date(order.createdAt).toLocaleString("th-TH", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {order.status === "PENDING" && payment?.method === "BANK_TRANSFER" && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm">
          <p className="font-bold text-amber-800">💳 รอการแจ้งชำระเงิน</p>
          <p className="mt-1 text-amber-700">
            กรุณาโอนเงิน {formatBaht(order.total)} เข้าบัญชี ธนาคารไทยพาณิชย์ 123-4-56789-0
            (ชื่อบัญชี ShopVerse Store) แล้วแจ้งชำระผ่านแอดมิน — คำสั่งซื้อจะถูกยืนยันภายใน 24 ชม.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Shipping address */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-bold">ที่อยู่จัดส่ง</h2>
          {order.shippingAddress ? (
            <div className="mt-3 text-sm leading-6 text-stone-600">
              <p className="font-semibold text-stone-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              </p>
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-400">ไม่ระบุ</p>
          )}
        </section>

        {/* Payment */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-bold">การชำระเงิน</h2>
          {payment ? (
            <div className="mt-3 text-sm text-stone-600">
              <p>
                วิธีชำระ:{" "}
                <span className="font-medium text-stone-900">
                  {PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS] ??
                    payment.method}
                </span>
              </p>
              <p className="mt-1">
                สถานะ:{" "}
                <span className="font-medium text-stone-900">
                  {payment.status === "PAID" ? "ชำระแล้ว" : payment.status === "PENDING" ? "รอชำระ" : payment.status}
                </span>
              </p>
              {payment.transactionRef && (
                <p className="mt-1">เลขที่อ้างอิง: {payment.transactionRef}</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-400">ไม่มีข้อมูล</p>
          )}
        </section>
      </div>

      {/* Items */}
      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-bold">รายการสินค้า</h2>
        <div className="mt-4 divide-y divide-stone-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.productImage}
                alt={item.productName}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-stone-400">
                  {formatBaht(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatBaht(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
        <dl className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">ยอดรวมสินค้า</dt>
            <dd className="font-medium">{formatBaht(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">ค่าจัดส่ง</dt>
            <dd className="font-medium">
              {order.shippingFee === 0 ? "ฟรี" : formatBaht(order.shippingFee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-stone-100 pt-3 text-base">
            <dt className="font-bold">ยอดรวมทั้งสิ้น</dt>
            <dd className="font-bold text-orange-600">{formatBaht(order.total)}</dd>
          </div>
        </dl>
        {order.note && (
          <p className="mt-4 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">
            <span className="font-semibold">หมายเหตุ:</span> {order.note}
          </p>
        )}
      </section>
    </div>
  );
}