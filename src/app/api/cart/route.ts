import { prisma } from "@/lib/prisma";
import { requireUser, apiError } from "@/lib/auth";
import { withErrorHandler, readJson } from "@/lib/api";
import { addCartItemSchema } from "@/lib/validations/cart";
import { zodMessage } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withErrorHandler(async () => {
    const user = await requireUser();

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true },
          orderBy: { id: "asc" },
        },
      },
    });

    const items = (cart?.items ?? []).map((item) => {
      const price = Number(item.product.price);
      return {
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl,
        price,
        priceFormatted: price.toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",
          maximumFractionDigits: 0,
        }),
        quantity: item.quantity,
        stock: item.product.stock,
        lineTotal: price * item.quantity,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

    return Response.json({
      cart: {
        id: cart?.id ?? null,
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        subtotal,
      },
    });
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const user = await requireUser();
    const body = await readJson(request);
    const parsed = addCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 422);
    }

    const { productId, quantity } = parsed.data;

    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      return apiError("ไม่พบสินค้า", 404);
    }

    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        return apiError("จำนวนสินค้าในสต็อกไม่เพียงพอ", 422);
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      if (quantity > product.stock) {
        return apiError("จำนวนสินค้าในสต็อกไม่เพียงพอ", 422);
      }
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const itemCount = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { quantity: true },
    });

    return Response.json({
      message: "เพิ่มสินค้าใส่ตะกร้าแล้ว",
      itemCount: itemCount._sum.quantity ?? 0,
    });
  });
}