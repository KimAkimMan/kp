import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseUpdateProgramInput } from "@/modules/programs/program.schema";
import { programService } from "@/modules/programs/program.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const programId = parsePositiveId((await context.params).id);
    return successResponse(await programService.get(programId, user));
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
      const id = parsePositiveId((await context.params).id);
      await programService.assertCanEdit(id, user);
      return successResponse(await programService.update(
        id,
        parseUpdateProgramInput(await parseRequestBody(request)),
        user,
      ));
    },
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/programs/[id]" } },
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
      return successResponse(await programService.remove(
        parsePositiveId((await context.params).id),
        user.id,
      ));
    },
    undefined,
    { idempotencyScope: { method: "DELETE", path: "/api/programs/[id]" } },
  );
}
