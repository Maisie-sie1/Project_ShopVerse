import Link from "next/link";
import { formatBaht, discountPercent } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount !== null && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <span className="rounded-full bg-stone-900 px-3 py-1 text-sm font-semibold text-white">
              สินค้าหมด
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-stone-400">{product.category?.name}</p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug hover:text-orange-600">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-lg font-bold text-stone-900">{formatBaht(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-xs text-stone-400 line-through">
                {formatBaht(product.compareAtPrice)}
              </p>
            )}
          </div>
          <div className="flex-1">
            <AddToCartButton product={product} compact />
          </div>
        </div>
      </div>
    </div>
  );
}