import { prisma } from "@/lib/prisma";
import { requireUser, apiError } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const user = await requireUser();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        shippingAddress: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!order) return apiError("ไม่พบคำสั่งซื้อ", 404);

    if (user.role !== "ADMIN" && order.userId !== user.id) {
      return apiError("คุณไม่มีสิทธิ์ดูคำสั่งซื้อนี้", 403);
    }

    return Response.json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        total: Number(order.total),
        items: order.items.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
        })),
      },
    });
  });
}