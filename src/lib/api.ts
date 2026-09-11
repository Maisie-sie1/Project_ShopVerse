import { apiError, requireAdmin, requireUser, getSessionUser } from "@/lib/auth";
import type { ZodError } from "zod";

/** Extract the first validation message from a Zod error (Zod v4 uses `issues`). */
export function zodMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
}

/** Safely parse JSON body; returns the parsed value or undefined. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/**
 * Wrap a route handler and translate the thrown sentinel errors we use
 * (UNAUTHORIZED / FORBIDDEN) plus unexpected errors into JSON responses.
 */
export function withErrorHandler(handler: () => Promise<Response>): Promise<Response> {
  return handler().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Something went wrong";
    if (message === "UNAUTHORIZED") return apiError("กรุณาเข้าสู่ระบบก่อน", 401);
    if (message === "FORBIDDEN") return apiError("คุณไม่มีสิทธิ์ใช้งานส่วนนี้", 403);
    console.error("[api-error]", error);
    return apiError(message || "เกิดข้อผิดพลาด", 400);
  });
}

export { requireUser, requireAdmin, getSessionUser };