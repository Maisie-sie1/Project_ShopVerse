import { getSessionUser } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api";

export async function GET() {
  return withErrorHandler(async () => {
    const user = await getSessionUser();
    return Response.json({ user });
  });
}