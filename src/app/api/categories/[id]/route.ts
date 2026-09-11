import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    await requireAdmin();
    const { id } = await params;

    let body: { name?: string; description?: string | null };
    try {
      body = await request.json();
    } catch {
      return apiError("ข้อมูลไม่ถูกต้อง", 422);
    }

    const name = (body.name ?? "").trim();
    if (!name || name.length < 2) {
      return apiError("ชื่อหมวดหมู่ต้องยาวอย่างน้อย 2 ตัวอักษร", 422);
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, description: body.description ?? null },
    });
    return Response.json({ category });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    await requireAdmin();
    const { id } = await params;

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return apiError("ไม่สามารถลบหมวดหมู่ที่มีสินค้าอยู่ได้", 409);
    }

    await prisma.category.delete({ where: { id } });
    return Response.json({ ok: true });
  });
}