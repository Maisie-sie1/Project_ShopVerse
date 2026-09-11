import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-stone-900 text-white">
              🛍️
            </span>
            ShopVerse
          </p>
          <p className="mt-3 text-sm text-stone-500">
            ร้านค้าออนไลน์ครบวงจร สินค้าคุณภาพ ราคาเป็นมิตร ส่งไวถึงมือคุณ
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">หมวดหมู่</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li><Link href="/shop?category=drinks" className="hover:text-stone-900">เครื่องดื่ม</Link></li>
            <li><Link href="/shop?category=bakery" className="hover:text-stone-900">เบเกอรี่</Link></li>
            <li><Link href="/shop?category=snacks" className="hover:text-stone-900">ของทานเล่น</Link></li>
            <li><Link href="/shop?category=fashion" className="hover:text-stone-900">แฟชั่น</Link></li>
            <li><Link href="/shop?category=electronics" className="hover:text-stone-900">อิเล็กทรอนิกส์</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">บริการ</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li><Link href="/shop" className="hover:text-stone-900">สินค้าทั้งหมด</Link></li>
            <li><Link href="/cart" className="hover:text-stone-900">ตะกร้าสินค้า</Link></li>
            <li><Link href="/account/orders" className="hover:text-stone-900">ติดตามคำสั่งซื้อ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">ติดต่อเรา</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            <li>อีเมล: hello@shopverse.example</li>
            <li>โทร: 02-123-4567</li>
            <li>ไลน์: @shopverse</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} ShopVerse Store. สงวนลิขสิทธิ์.
      </div>
    </footer>
  );
}