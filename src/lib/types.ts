export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { products: number };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  reviews?: Review[];
};

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string };
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  quantity: number;
  stock: number;
  lineTotal: number;
};

export type Cart = {
  id: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "CARD";

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  note: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
  payments: Payment[];
  shippingAddress?: {
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
  } | null;
  user?: { id: string; name: string; email: string };
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
};

export type Payment = {
  id: string;
  method: PaymentMethod;
  status: string;
  amount: number;
  transactionRef: string | null;
  paidAt: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "รอดำเนินการ",
  PAID: "ชำระเงินแล้ว",
  PROCESSING: "กำลังเตรียมสินค้า",
  SHIPPED: "กำลังจัดส่ง",
  DELIVERED: "จัดส่งเรียบร้อย",
  CANCELLED: "ยกเลิก",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: "เก็บเงินปลายทาง",
  BANK_TRANSFER: "โอนเงินผ่านธนาคาร",
  CARD: "บัตรเครดิต/เดบิต",
};