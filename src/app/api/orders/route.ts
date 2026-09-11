import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin, apiError } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api";
import { checkoutSchema } from "@/lib/validations/checkout";
import { genOrderNumber } from "@/lib/utils";
import type { OrderStatus, PaymentMethod } from "@prisma/client";
import { zodMessage } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const user = await requireUser();
    const url = new URL(request.url);
    const isAdmin = user.role === "ADMIN" && url.searchParams.get("scope") === "all";

    const orders = await prisma.order.findMany({
      where: isAdmin ? undefined : { userId: user.id },
      include: {
        items: true,
        payments: true,
        shippingAddress: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({
      orders: orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        shippingFee: Number(o.shippingFee),
        total: Number(o.total),
      })),
    });
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    if (!body) return apiError("ข้อมูลไม่ถูกต้อง", 422);

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 422);
    }

    const { address, paymentMethod, note, saveAddress } = parsed.data;

    // Fetch cart with products
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      return apiError("ตะกร้าสินค้าว่างเปล่า", 422);
    }

    // Stock check + subtotal
    let subtotal = 0;
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return apiError(`สินค้า "${item.product.name}" มีสต็อกไม่เพียงพอ`, 422);
      }
      if (!item.product.isActive) {
        return apiError(`สินค้า "${item.product.name}" ถูกนำออกจากร้านแล้ว`, 422);
      }
      subtotal += Number(item.product.price) * item.quantity;
    }

    const shippingFee = subtotal >= 1000 ? 0 : 60;
    const total = subtotal + shippingFee;

    // Save address book entry if requested
    let addressRecord = null;
    if (saveAddress) {
      addressRecord = await prisma.address.create({
        data: { userId: user.id, label: "ที่อยู่จัดส่ง", ...address },
      });
    }

    // Create order within a transaction
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: genOrderNumber(),
          userId: user.id,
          subtotal,
          shippingFee,
          total,
          note: note ?? null,
          shippingAddressId: addressRecord?.id ?? null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productImage: item.product.imageUrl,
              unitPrice: Number(item.product.price),
              quantity: item.quantity,
            })),
          },
          payments: {
            create: {
              method: paymentMethod as PaymentMethod,
              status: "PENDING",
              amount: total,
            },
          },
        },
        include: { items: true, payments: true },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return Response.json(
      { order: { ...order, subtotal: Number(order.subtotal), shippingFee: Number(order.shippingFee), total: Number(order.total) } },
      { status: 201 }
    );
  });
}

// Admin: update order status
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    if (!body) return apiError("ข้อมูลไม่ถูกต้อง", 422);

    const { orderId, status } = body as { orderId?: string; status?: OrderStatus };

    if (!orderId) return apiError("ไม่พบรหัสคำสั่งซื้อ", 422);
    const allowed: OrderStatus[] = [
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!status || !allowed.includes(status)) {
      return apiError("สถานะไม่ถูกต้อง", 422);
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return Response.json({
      order: { ...order, subtotal: Number(order.subtotal), shippingFee: Number(order.shippingFee), total: Number(order.total) },
    });
  });
}