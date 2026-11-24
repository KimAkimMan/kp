import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { programAssignmentService } from "@/modules/programs/program-assignment.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const programId = parsePositiveId((await context.params).id);
    const result = await programAssignmentService.list(programId, user);
    return successResponse(result);
  });
}
export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const programId = parsePositiveId((await context.params).id);
      const body = await parseRequestBody(request) as Record<string, unknown>;
      const { operatorId } = body;

      if (!operatorId || typeof operatorId !== "number") {
        throw new ApiError("VALIDATION_ERROR", "operatorId wajib diisi.", 400);
      }

      const notesValue = typeof body.notes === "string" ? body.notes : undefined;
      const result = await programAssignmentService.create(
        programId,
        { operatorId, notes: notesValue },
        user as AuthenticatedUser,
      );
      return successResponse(result, 201);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/programs/[id]/assignments" } },
  );
}
