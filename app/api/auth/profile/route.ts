import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { authService } from "@/modules/auth/auth.service";
import { parseRequestBody } from "@/lib/http/request";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

export async function PATCH(request: NextRequest) {
  return handleRoute(
    async () => {
      const user = await requireUser();
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      return successResponse(await authService.updateProfile(user, await parseRequestBody(request)));
    },
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/auth/profile" } },
  );
}
