import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { readJson, withErrorHandler, zodMessage } from "@/lib/api";
import { apiError } from "@/lib/auth";

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await readJson(request);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 422);
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("อีเมลนี้มีการลงทะเบียนแล้ว", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = await createSessionToken(user.id);
    await setSessionCookie(token);

    return Response.json({ user }, { status: 201 });
  });
}