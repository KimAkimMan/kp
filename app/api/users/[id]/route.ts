import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parseUpdateUserInput } from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    return successResponse(await userService.get(parsePositiveId((await context.params).id)));
  });
}

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const id = parsePositiveId((await context.params).id);
      return successResponse(await userService.update(id, parseUpdateUserInput(await parseRequestBody(request))));
    },
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/users/[id]" } },
  );
}

export async function DELETE(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      return successResponse(await userService.remove(parsePositiveId((await context.params).id), user.id));
    },
    undefined,
    { idempotencyScope: { method: "DELETE", path: "/api/users/[id]" } },
  );
}
