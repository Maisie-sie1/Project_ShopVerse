import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return withErrorHandler(async () => {
    await requireAdmin();

    const [totalProducts, totalOrders, totalUsers, totalRevenue, recentOrders, lowStock] =
      await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.order.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: "CANCELLED" } },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } } },
        }),
        prisma.product.findMany({
          where: { stock: { lte: 5 }, isActive: true },
          orderBy: { stock: "asc" },
          take: 5,
        }),
      ]);

    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    return Response.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: Number(totalRevenue._sum.total ?? 0),
        statusCounts,
        lowStock,
        recentOrders: recentOrders.map((o) => ({
          ...o,
          total: Number(o.total),
        })),
      },
    });
  });
}