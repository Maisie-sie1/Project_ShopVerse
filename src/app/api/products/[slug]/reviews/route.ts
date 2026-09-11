import { prisma } from "@/lib/prisma";
import { requireUser, apiError } from "@/lib/auth";
import { withErrorHandler, readJson } from "@/lib/api";
import { reviewSchema } from "@/lib/validations/checkout";
import { zodMessage } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandler(async () => {
    const user = await requireUser();
    const { slug } = await params;
    const body = await readJson(request);
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 422);
    }

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      return apiError("ไม่พบสินค้า", 404);
    }

    // Must have purchased the product to review it
    const purchased = await prisma.orderItem.count({
      where: {
        productId: product.id,
        order: { userId: user.id, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      },
    });
    if (purchased === 0) {
      return apiError("กรุณาซื้อสินค้าก่อนจึงจะรีวิวได้", 403);
    }

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId: product.id, userId: user.id } },
    });
    if (existing) {
      return apiError("คุณได้รีวิวสินค้าชิ้นนี้แล้ว", 409);
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return Response.json({ review }, { status: 201 });
  });
}