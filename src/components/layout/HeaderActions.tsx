"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import type { SessionUser } from "@/lib/auth";
import { useState } from "react";

export function HeaderActions({ user }: { user: SessionUser | null }) {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => router.push("/shop")}
        className="hidden h-9 w-9 place-items-center rounded-full text-stone-600 hover:bg-stone-100 sm:grid"
        aria-label="ค้นหาสินค้า"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
        </svg>
      </button>

      <Link
        href="/cart"
        className="relative grid h-9 w-9 place-items-center rounded-full text-stone-600 hover:bg-stone-100"
        aria-label="ตะกร้าสินค้า"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>

      {user ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full bg-stone-900 text-sm font-semibold text-white hover:bg-stone-700"
            aria-label="บัญชีผู้ใช้"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="ปิดเมนู"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                <div className="border-b border-stone-100 px-3 py-2">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-stone-500">{user.email}</p>
                </div>
                <div className="py-1">
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-sm hover:bg-stone-50 ${
                        pathname.startsWith("/admin") ? "font-semibold text-orange-600" : ""
                      }`}
                    >
                      แผงผู้ดูแลระบบ
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm hover:bg-stone-50 ${
                      pathname.startsWith("/account") ? "font-semibold text-orange-600" : ""
                    }`}
                  >
                    บัญชีของฉัน
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-stone-50"
                  >
                    คำสั่งซื้อของฉัน
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  ออกจากระบบ
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700"
        >
          เข้าสู่ระบบ
        </Link>
      )}
    </div>
  );
}