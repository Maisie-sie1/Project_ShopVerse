import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/auth";
import { withErrorHandler, readJson } from "@/lib/api";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/slugify";
import { zodMessage } from "@/lib/api";

export const dynamic = "force-dynamic";

function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const where: Record<string, unknown> = {
      isActive: searchParams.get("all") === "1" ? undefined : true,
    };
    if (!where.isActive) delete where.isActive;

    // Category filter (by slug or id)
    const category = searchParams.get("category");
    if (category) {
      where.category = {
        OR: [{ slug: category }, { id: category }],
      };
    }

    const search = searchParams.get("search")?.trim();
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const minPrice = parsePrice(searchParams.get("minPrice"));
    const maxPrice = parsePrice(searchParams.get("maxPrice"));
    if (minPrice !== null || maxPrice !== null) {
      where.price = {
        ...(minPrice !== null ? { gte: minPrice } : {}),
        ...(maxPrice !== null ? { lte: maxPrice } : {}),
      };
    }

    // Pagination
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(48, Math.max(1, Number(searchParams.get("pageSize")) || 12));
    const skip = (page - 1) * pageSize;

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true, slug: true } } },
      skip,
      take: pageSize,
    });

    return Response.json({
      products,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    await requireAdmin();
    const body = await readJson(request);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 422);
    }

    const data = parsed.data;
    const slug = data.slug || slugify(data.name);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return apiError("มีสินค้าที่ใช้ slug นี้อยู่แล้ว", 409);
    }

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return apiError("ไม่พบหมวดหมู่ที่เลือก", 422);
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        imageUrl: data.imageUrl,
        stock: data.stock,
        isActive: data.isActive ?? true,
        categoryId: data.categoryId,
      },
    });
    return Response.json({ product }, { status: 201 });
  });
}