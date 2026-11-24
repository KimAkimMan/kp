import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { requireRole } from "@/modules/auth/auth.context";
import { userService } from "@/modules/users/user.service";
import { parseJsonObject, passwordString } from "@/lib/validation";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const { id } = await context.params;
      await userService.update(parsePositiveId(id), { password: passwordString(parseJsonObject(await parseRequestBody(request))) });
      return successResponse({ reset: true });
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/users/[id]/reset-password" } },
  );
}
