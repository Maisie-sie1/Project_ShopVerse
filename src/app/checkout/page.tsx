"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatBaht } from "@/lib/utils";
import type { Cart, PaymentMethod } from "@/lib/types";

type AddressForm = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const emptyAddress: AddressForm = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Thailand",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { refresh } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [saveAddress, setSaveAddress] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      if (!res.ok) throw new Error("โหลดตะกร้าไม่สำเร็จ");
      const data = await res.json();
      setCart(data.cart);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCart();
  }, [loadCart]);

  function updateField(key: keyof AddressForm, value: string) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  const shippingFee = cart && cart.subtotal >= 1000 ? 0 : 60;
  const total = cart ? cart.subtotal + shippingFee : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          paymentMethod,
          note: note.trim() || null,
          saveAddress,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      if (!res.ok) {
        setError(data?.error ?? "สั่งซื้อไม่สำเร็จ");
        return;
      }
      await refresh();
      router.push(`/account/orders/${data.order.id}`);
    } catch {
      setError("เกิดข้อผิดพลาด โปรดลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-stone-400">กำลังโหลด...</div>;
  }

  if (authError) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-2xl font-bold">กรุณาเข้าสู่ระบบ</h1>
        <p className="mt-2 text-stone-500">เข้าสู่ระบบเพื่อดำเนินการสั่งซื้อ</p>
        <Link
          href="/login?next=/checkout"
          className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold">ตะกร้าว่างเปล่า</h1>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          ไปเลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">ชำระเงิน</h1>
      <p className="mt-1 text-sm text-stone-500">กรอกข้อมูลการจัดส่งเพื่อดำเนินการสั่งซื้อ</p>

      <form onSubmit={handleSubmit} className="mt-8 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
        <div className="space-y-6">
          {/* Address */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-bold">ข้อมูลการจัดส่ง</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">ชื่อผู้รับ *</label>
                <input
                  required
                  value={address.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={inputClass}
                  placeholder="สมชาย ใจดี"
                />
              </div>
              <div>
                <label className="text-sm font-medium">เบอร์โทรศัพท์ *</label>
                <input
                  required
                  type="tel"
                  value={address.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={inputClass}
                  placeholder="081-234-5678"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">ที่อยู่ (บ้านเลขที่ / ถนน) *</label>
                <input
                  required
                  value={address.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  className={inputClass}
                  placeholder="123/45 ถ.สุขุมวิท"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">ที่อยู่เพิ่มเติม</label>
                <input
                  value={address.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                  className={inputClass}
                  placeholder="อาคาร/ชั้น/ห้อง (ไม่บังคับ)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">อำเภอ/เขต *</label>
                <input
                  required
                  value={address.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={inputClass}
                  placeholder="วัฒนา"
                />
              </div>
              <div>
                <label className="text-sm font-medium">จังหวัด *</label>
                <input
                  required
                  value={address.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className={inputClass}
                  placeholder="กรุงเทพมหานคร"
                />
              </div>
              <div>
                <label className="text-sm font-medium">รหัสไปรษณีย์ *</label>
                <input
                  required
                  value={address.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  className={inputClass}
                  placeholder="10110"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ประเทศ</label>
                <input
                  value={address.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className={inputClass}
                  placeholder="Thailand"
                />
              </div>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-orange-600"
              />
              บันทึกที่อยู่นี้ไว้ในบัญชีของฉัน
            </label>
          </section>

          {/* Shipping & payment */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-bold">วิธีการชำระเงิน</h2>
            <div className="mt-4 space-y-3">
              {(
                [
                  ["CASH_ON_DELIVERY", "เก็บเงินปลายทาง", "ชำระเงินสดเมื่อได้รับสินค้า"],
                  ["BANK_TRANSFER", "โอนเงินผ่านธนาคาร", "โอนเข้าบัญชีแล้วแจ้งชำระผ่านแอดมิน"],
                  ["CARD", "บัตรเครดิต/เดบิต", "ชำระด้วยบัตร Visa / Mastercard"],
                ] as const
              ).map(([value, label, desc]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                    paymentMethod === value
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="mt-1 h-4 w-4 text-orange-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs text-stone-500">{desc}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">หมายเหตุ (ไม่บังคับ)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="เช่น จัดส่งเฉพาะช่วงเย็น"
              />
            </div>
          </section>
        </div>

        {/* Order summary */}
        <aside className="mt-6 h-fit rounded-2xl border border-stone-200 bg-white p-6 lg:mt-0">
          <h2 className="font-bold">สรุปคำสั่งซื้อ</h2>
          <div className="mt-4 max-h-56 space-y-3 overflow-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-stone-400">x{item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatBaht(item.lineTotal)}</p>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">ยอดรวมสินค้า</dt>
              <dd className="font-medium">{formatBaht(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">ค่าจัดส่ง</dt>
              <dd className="font-medium">{shippingFee === 0 ? "ฟรี" : formatBaht(shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-3 text-base">
              <dt className="font-bold">ยอดรวมทั้งสิ้น</dt>
              <dd className="font-bold text-orange-600">{formatBaht(total)}</dd>
            </div>
          </dl>
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-full bg-stone-900 py-3.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "กำลังดำเนินการ..." : "ยืนยันการสั่งซื้อ"}
          </button>
          <Link
            href="/cart"
            className="mt-3 block text-center text-sm text-stone-500 hover:text-stone-900"
          >
            ← กลับไปแก้ไขตะกร้า
          </Link>
        </aside>
      </form>
    </div>
  );
}