import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "ชื่อสินค้าต้องยาวอย่างน้อย 2 ตัวอักษร"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข หรือเครื่องหมาย - เท่านั้น")
    .optional(),
  description: z.string().min(10, "คำอธิบายต้องยาวอย่างน้อย 10 ตัวอักษร"),
  price: z.coerce.number().positive("ราคาต้องมากกว่า 0"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  imageUrl: z.string().url("URL รูปภาพไม่ถูกต้อง"),
  stock: z.coerce.number().int().min(0, "สต็อกต้องไม่ติดลบ"),
  categoryId: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  isActive: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "ชื่อหมวดหมู่ต้องยาวอย่างน้อย 2 ตัวอักษร"),
  description: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;