import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { ApiError } from "@/lib/http/api-error";
import { requireRole } from "@/modules/auth/auth.context";
import { programService } from "@/modules/programs/program.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("OPERATOR");
      const id = parsePositiveId((await context.params).id);
      const rateLimit = await operationRateLimiter.check(_request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      return successResponse(await programService.claim(id, user));
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/programs/[id]/claim" } },
  );
}
