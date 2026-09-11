"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });

      if (res.status === 401) {
        router.push(`/login?next=/product/${productSlug}`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "ส่งรีวิวไม่สำเร็จ");
        return;
      }

      setSuccess(true);
      setComment("");
      setRating(5);
      setTimeout(() => router.refresh(), 800);
    } catch {
      setError("เกิดข้อผิดพลาด โปรดลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="font-bold">เขียนรีวิว</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium">ระดับความพอใจ</label>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? "text-amber-500" : "text-stone-300"}`}
                aria-label={`${star} ดาว`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="review-comment" className="text-sm font-medium">
            ความคิดเห็น
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="แสดงความคิดเห็นเกี่ยวกับสินค้า..."
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">ขอบคุณสำหรับรีวิว! 🎉</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "กำลังส่ง..." : "ส่งรีวิว"}
        </button>
      </form>
    </div>
  );
}