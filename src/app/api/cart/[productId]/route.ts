import { prisma } from "@/lib/prisma";
import { requireUser, apiError } from "@/lib/auth";
import { withErrorHandler, readJson } from "@/lib/api";
import { updateCartItemSchema } from "@/lib/validations/cart";
import { zodMessage } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  return withErrorHandler(async () => {
    const user = await requireUser();
    const { productId } = await params;
    const body = await readJson(request);
    const parsed = updateCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 422);
    }

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      return apiError("ไม่พบตะกร้าสินค้า", 404);
    }

    const item = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      include: { product: true },
    });
    if (!item) {
      return apiError("ไม่พบสินค้าในตะกร้า", 404);
    }

    const quantity = parsed.data.quantity;
    if (quantity > item.product.stock) {
      return apiError("จำนวนสินค้าในสต็อกไม่เพียงพอ", 422);
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return Response.json({ ok: true });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  return withErrorHandler(async () => {
    const user = await requireUser();
    const { productId } = await params;

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      return apiError("ไม่พบตะกร้าสินค้า", 404);
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    return Response.json({ ok: true });
  });
}