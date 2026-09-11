import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "กรุณากรอกชื่อผู้รับ"),
  phone: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง"),
  line1: z.string().min(3, "กรุณากรอกที่อยู่"),
  line2: z.string().optional().nullable(),
  city: z.string().min(2, "กรุณากรอกอำเภอ/เขต"),
  state: z.string().optional().nullable(),
  postalCode: z.string().min(3, "กรุณากรอกรหัสไปรษณีย์"),
  country: z.string().min(2).default("Thailand"),
});

export const checkoutSchema = z.object({
  address: addressSchema,
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BANK_TRANSFER", "CARD"]),
  note: z.string().optional().nullable(),
  saveAddress: z.boolean().optional().default(false),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3).optional().nullable(),
});