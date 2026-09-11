import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { createSessionToken, setSessionCookie, apiError } from "@/lib/auth";
import { readJson, withErrorHandler, zodMessage } from "@/lib/api";

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await readJson(request);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(zodMessage(parsed.error), 422);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiError("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return apiError("อีเมลหรือรหัสผ่านไม่ถูกต้อง", 401);
    }

    const token = await createSessionToken(user.id);
    await setSessionCookie(token);

    return Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
}