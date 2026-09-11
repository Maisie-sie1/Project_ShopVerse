import Link from "next/link";
import { HeaderActions } from "./HeaderActions";
import type { SessionUser } from "@/lib/auth";

export function Header({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-900 text-white">
            🛍️
          </span>
          <span>
            Shop<span className="text-orange-600">Verse</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          <Link href="/shop" className="hover:text-stone-950">
            สินค้าทั้งหมด
          </Link>
          <Link href="/shop?category=fashion" className="hover:text-stone-950">
            แฟชั่น
          </Link>
          <Link href="/shop?category=electronics" className="hover:text-stone-950">
            อิเล็กทรอนิกส์
          </Link>
          <Link href="/shop?category=bakery" className="hover:text-stone-950">
            เบเกอรี่
          </Link>
        </nav>

        <HeaderActions user={user} />
      </div>
    </header>
  );
}