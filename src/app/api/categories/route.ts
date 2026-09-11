import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/auth";
import { withErrorHandler, readJson } from "@/lib/api";
import { categorySchema } from "@/lib/validations/product";
import { slugify } from "@/lib/slugify";
import { zodMessage } from "@/lib/api";

export async function GET() {
  return withErrorHandler(async () => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    return Response.json({ categories });
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    await requireAdmin();
    const body = await readJson(request);
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 422);
    }

    const name = parsed.data.name.trim();
    const slug = slugify(name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return apiError("มีหมวดหมู่ชื่อนี้อยู่แล้ว", 409);
    }

    const category = await prisma.category.create({
      data: { name, slug, description: parsed.data.description ?? null },
    });
    return Response.json({ category }, { status: 201 });
  });
}