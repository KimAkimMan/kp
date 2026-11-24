import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { requireRole } from "@/modules/auth/auth.context";
import { parseDirectUploadInput } from "@/modules/storage/direct-upload.service";
import { programCostService } from "@/modules/programs/program-cost.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ costId: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN", "OPERATOR");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const { costId } = await context.params;
      const input = parseDirectUploadInput(await parseRequestBody(request));
      return successResponse(await programCostService.presignDirect(parsePositiveId(costId, "costId"), input, user));
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/costs/[costId]/documents/presign" } },
  );
}
