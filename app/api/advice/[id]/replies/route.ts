import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { adviceReplyService } from "@/modules/advice/advice-reply.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { parseRequestBody } from "@/lib/http/request";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const adviceId = (await context.params).id;
    const result = await adviceReplyService.list(adviceId, user as AuthenticatedUser);
    return successResponse(result);
  });
}
export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN", "OPERATOR", "PIMPINAN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const adviceId = (await context.params).id;
      const body = await parseRequestBody(request) as Record<string, unknown>;
      const { isi } = body;

      if (!isi || typeof isi !== "string" || isi.trim().length === 0) {
        throw new ApiError("VALIDATION_ERROR", "Isi balasan wajib diisi.", 400);
      }

      const result = await adviceReplyService.create(
        adviceId,
        { isi: isi.trim() },
        user as AuthenticatedUser,
      );
      return successResponse(result, 201);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/advice/[id]/replies" } },
  );
}
