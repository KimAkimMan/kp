import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseAdviceStatusInput } from "@/modules/advice/advice.schema";
import { adviceService } from "@/modules/advice/advice.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const { id } = await context.params;
    return successResponse(await adviceService.get(id, user));
  });
}

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN", "OPERATOR");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const { status } = parseAdviceStatusInput(await parseRequestBody(request));
      return successResponse(await adviceService.updateStatus((await context.params).id, status, user));
    },
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/advice/[id]" } },
  );
}

export async function DELETE(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("PIMPINAN", "ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      return successResponse(await adviceService.remove((await context.params).id, user.id));
    },
    undefined,
    { idempotencyScope: { method: "DELETE", path: "/api/advice/[id]" } },
  );
}
