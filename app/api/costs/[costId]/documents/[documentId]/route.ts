import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { programCostService } from "@/modules/programs/program-cost.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ costId: string; documentId: string }> };

export async function DELETE(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN", "OPERATOR");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const { documentId } = await context.params;
      const result = await programCostService.deleteDocument(documentId, user);
      return successResponse(result);
    },
    undefined,
    { idempotencyScope: { method: "DELETE", path: "/api/costs/[costId]/documents/[documentId]" } },
  );
}
