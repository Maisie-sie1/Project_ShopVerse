import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/server-fetch";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { formatBaht, discountPercent } from "@/lib/utils";
import { ReviewForm } from "@/components/product/ReviewForm";
import type { Product } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await apiFetch<{ product: Product }>(`/api/products/${slug}`);
    return {
      title: product.name,
      description: product.description.slice(0, 160),
    };
  } catch {
    return { title: "สินค้า" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: Product | null = null;
  try {
    const res = await apiFetch<{ product: Product }>(`/api/products/${slug}`);
    product = res.product;
  } catch {
    notFound();
  }

  const discount = discountPercent(product.price, product.compareAtPrice);
  const avgRating = product.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="mt-8 lg:mt-0">
          <p className="text-sm font-medium text-orange-600">
            {product.category?.name ?? ""}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-amber-500">
              {"★".repeat(Math.round(avgRating ?? 0))}
              <span className="text-stone-300">{"★".repeat(5 - Math.round(avgRating ?? 0))}</span>
            </span>
            <span className="text-stone-500">
              {avgRating ? `${avgRating.toFixed(1)}` : "ยังไม่มีรีวิว"} (
              {product.reviews?.length ?? 0} รีวิว)
            </span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <p className="text-4xl font-extrabold text-stone-900">
              {formatBaht(product.price)}
            </p>
            {product.compareAtPrice && (
              <>
                <p className="text-lg text-stone-400 line-through">
                  {formatBaht(product.compareAtPrice)}
                </p>
                {discount !== null && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-bold text-red-600">
                    ลด {discount}%
                  </span>
                )}
              </>
            )}
          </div>

          <p className={`mt-2 text-sm ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
            {product.stock > 0 ? `เหลือ ${product.stock} ชิ้น` : "สินค้าหมด"}
          </p>

          <p className="mt-6 leading-7 text-stone-600">{product.description}</p>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl bg-stone-50 p-4 text-center text-sm">
            <div>
              <p className="text-lg">🚚</p>
              <p className="mt-1 font-medium">ส่งเร็ว 1-3 วัน</p>
            </div>
            <div>
              <p className="text-lg">🛡️</p>
              <p className="mt-1 font-medium">รับประกันสินค้า</p>
            </div>
            <div>
              <p className="text-lg">💬</p>
              <p className="mt-1 font-medium">แชท 24 ชม.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">รีวิวจากลูกค้า</h2>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="mt-6 space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-stone-200 text-sm font-bold">
                      {review.user.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{review.user.name}</p>
                      <p className="text-xs text-stone-400">
                        {new Date(review.createdAt).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>
                  <span className="text-amber-500">
                    {"★".repeat(review.rating)}
                    <span className="text-stone-300">{"★".repeat(5 - review.rating)}</span>
                  </span>
                </div>
                {review.comment && <p className="mt-3 text-sm text-stone-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-stone-500">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
        )}

        <ReviewForm productSlug={product.slug} />
      </section>
    </div>
  );
}