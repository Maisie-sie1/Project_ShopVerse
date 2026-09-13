"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string };

const emptyForm = {
  name: "",
  description: "",
  slug: "",
  price: "",
  compareAtPrice: "",
  imageUrl: "",
  stock: "0",
  categoryId: "",
  isActive: true,
};

export function ProductForm({ mode, slug }: { mode: "create" | "edit"; slug?: string }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      setCategories(data.categories);
      setForm((prev) => ({
        ...prev,
        categoryId: prev.categoryId || data.categories[0]?.id || "",
      }));
    } catch {
      // ignore
    }
  }, []);

  const loadProduct = useCallback(
    async (productSlug: string) => {
      try {
        const res = await fetch(`/api/products/${productSlug}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const { product } = await res.json();
        setForm({
          name: product.name,
          description: product.description,
          slug: product.slug,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          imageUrl: product.imageUrl,
          stock: String(product.stock),
          categoryId: product.categoryId,
          isActive: product.isActive,
        });
      } catch {
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
    if (isEdit && slug) loadProduct(slug);
  }, [isEdit, slug, loadCategories, loadProduct]);

  function update(key: keyof typeof emptyForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      imageUrl: form.imageUrl,
      stock: Number(form.stock),
      categoryId: form.categoryId,
      isActive: form.isActive,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/products/${slug}` : "/api/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? (isEdit ? "แก้ไขสินค้าไม่สำเร็จ" : "เพิ่มสินค้าไม่สำเร็จ"));
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาด โปรดลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500";

  if (loading) return <p className="text-stone-400">กำลังโหลด...</p>;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-sm text-stone-500 hover:text-stone-900">
        ← กลับไปจัดการสินค้า
      </Link>
      <h2 className="mt-2 text-2xl font-bold">{isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
        <div>
          <label htmlFor="name" className="text-sm font-medium">ชื่อสินค้า *</label>
          <input
            id="name"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            placeholder="เช่น กาแฟดริป สายชง"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="slug" className="text-sm font-medium">Slug (URL)</label>
            <input
              id="slug"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              className={inputClass}
              placeholder="อัตโนมัติถ้าออกจากช่องว่าง"
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="text-sm font-medium">หมวดหมู่ *</label>
            <select
              id="categoryId"
              required
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className={inputClass}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="price" className="text-sm font-medium">ราคา (บาท) *</label>
            <input
              id="price"
              required
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className={inputClass}
              placeholder="290"
            />
          </div>
          <div>
            <label htmlFor="compareAtPrice" className="text-sm font-medium">ราคาป้ายแดง (บาท)</label>
            <input
              id="compareAtPrice"
              type="number"
              min={0}
              step="0.01"
              value={form.compareAtPrice}
              onChange={(e) => update("compareAtPrice", e.target.value)}
              className={inputClass}
              placeholder="350"
            />
          </div>
          <div>
            <label htmlFor="stock" className="text-sm font-medium">สต็อก (ชิ้น) *</label>
            <input
              id="stock"
              required
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="imageUrl" className="text-sm font-medium">URL รูปภาพ *</label>
          <input
            id="imageUrl"
            required
            type="text"
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            className={inputClass}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div>
          <label htmlFor="description" className="text-sm font-medium">คำอธิบาย *</label>
          <textarea
            id="description"
            required
            minLength={10}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="รายละเอียดสินค้า..."
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-orange-600"
          />
          แสดงสินค้าบนหน้าร้าน
        </label>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
          </button>
          <Link
            href="/admin/products"
            className="rounded-full border border-stone-300 px-6 py-3 font-medium text-stone-600 hover:bg-stone-50"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}