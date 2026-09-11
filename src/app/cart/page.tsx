"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatBaht } from "@/lib/utils";
import type { Cart } from "@/lib/types";

export default function CartPage() {
  const { refresh } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.status === 401) {
        setError("login");
        return;
      }
      if (!res.ok) throw new Error("โหลดตะกร้าไม่สำเร็จ");
      const data = await res.json();
      setCart(data.cart);
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    const res = await fetch(`/api/cart/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) return;
    await Promise.all([loadCart(), refresh()]);
  }

  async function removeItem(productId: string) {
    await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    await Promise.all([loadCart(), refresh()]);
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-stone-400">กำลังโหลดตะกร้า...</div>;
  }

  if (error === "login") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-2xl font-bold">กรุณาเข้าสู่ระบบ</h1>
        <p className="mt-2 text-stone-500">เข้าสู่ระบบเพื่อดูตะกร้าสินค้าของคุณ</p>
        <Link
          href="/login?next=/cart"
          className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  if (error) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-red-600">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold">ตะกร้าว่างเปล่า</h1>
        <p className="mt-2 text-stone-500">ยังไม่มีสินค้าในตะกร้า ไปเลือกช้อปกันเลย!</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          เริ่มช้อปปิ้ง
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">ตะกร้าสินค้า</h1>
      <p className="mt-1 text-sm text-stone-500">{cart.itemCount} รายการ</p>

      <div className="mt-8 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4"
            >
              <Link href={`/product/${item.slug}`} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-24 w-24 rounded-xl object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/product/${item.slug}`} className="font-medium hover:text-orange-600">
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-stone-400 hover:text-red-600"
                    aria-label="ลบสินค้า"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-stone-400">หน่วยละ {formatBaht(item.price)}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border border-stone-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className="grid h-8 w-8 place-items-center text-stone-500 hover:text-stone-900"
                      aria-label="ลดจำนวน"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                      className="grid h-8 w-8 place-items-center text-stone-500 hover:text-stone-900"
                      aria-label="เพิ่มจำนวน"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold">{formatBaht(item.lineTotal)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 h-fit rounded-2xl border border-stone-200 bg-white p-6 lg:mt-0">
          <h2 className="font-bold">สรุปคำสั่งซื้อ</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">ยอดรวมสินค้า</dt>
              <dd className="font-medium">{formatBaht(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">ค่าจัดส่ง</dt>
              <dd className="font-medium">{cart.subtotal >= 1000 ? "ฟรี" : formatBaht(60)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-3 text-base">
              <dt className="font-bold">ยอดรวมทั้งสิ้น</dt>
              <dd className="font-bold text-orange-600">
                {formatBaht(cart.subtotal + (cart.subtotal >= 1000 ? 0 : 60))}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-stone-400">
            {cart.subtotal >= 1000
              ? "🎉 คุณได้รับสิทธิ์ส่งฟรีแล้ว!"
              : `สั่งเพิ่มอีก ${formatBaht(1000 - cart.subtotal)} เพื่อส่งฟรี`}
          </p>
          <Link
            href="/checkout"
            className="mt-5 block w-full rounded-full bg-stone-900 py-3 text-center font-semibold text-white hover:bg-orange-600"
          >
            ดำเนินการสั่งซื้อ
          </Link>
          <Link
            href="/shop"
            className="mt-3 block text-center text-sm text-stone-500 hover:text-stone-900"
          >
            ← เลือกซื้อสินค้าเพิ่ม
          </Link>
        </div>
      </div>
    </div>
  );
}