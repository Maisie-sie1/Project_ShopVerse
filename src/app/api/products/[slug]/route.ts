import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/auth";
import { withErrorHandler, readJson } from "@/lib/api";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/slugify";
import { zodMessage } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandler(async () => {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });
    if (!product || !product.isActive) {
      return apiError("ไม่พบสินค้า", 404);
    }
    return Response.json({ product });
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandler(async () => {
    await requireAdmin();
    const { slug } = await params;
    const body = await readJson(request);
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 422);
    }

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      return apiError("ไม่พบสินค้า", 404);
    }

    const data = parsed.data;
    const update = {
      ...(data.name ? { name: data.name } : {}),
      ...(data.slug ? { slug: slugify(data.slug) } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.compareAtPrice !== undefined
        ? { compareAtPrice: data.compareAtPrice ?? null }
        : {}),
      ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
      ...(data.stock !== undefined ? { stock: data.stock } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
    };

    const product = await prisma.product.update({
      where: { slug },
      data: update,
      include: { category: true },
    });
    return Response.json({ product });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandler(async () => {
    await requireAdmin();
    const { slug } = await params;
    await prisma.product.delete({ where: { slug } });
    return Response.json({ ok: true });
  });
}