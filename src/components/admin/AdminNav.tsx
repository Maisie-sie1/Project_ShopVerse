"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "แดชบอร์ด", icon: "📊" },
  { href: "/admin/products", label: "จัดการสินค้า", icon: "📦" },
  { href: "/admin/orders", label: "จัดการคำสั่งซื้อ", icon: "🧾" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-stone-200 bg-white p-2">
      {links.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium ${
              active ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <span className="mr-1">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}