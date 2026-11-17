import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { getStorage } from "@/lib/storage";

export async function GET(_request: NextRequest, context: { params: Promise<{ key: string }> }) {
  return handleRoute(async () => {
    await requireUser();
    const { key } = await context.params;
    const storage = getStorage();
    const url = storage.getPublicUrl(key);
    // Redirect ke public URL (untuk mock/local akan serve file, untuk Vercel/R2 akan redirect ke CDN)
    return Response.redirect(url, 302);
  });
}