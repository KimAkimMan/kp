import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { programAssignmentService } from "@/modules/programs/program-assignment.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ id: string; assignmentId: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const { assignmentId } = await context.params;
      const user = await requireRole("OPERATOR");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const assignmentIdNum = parsePositiveId(assignmentId);
      const result = await programAssignmentService.accept(
        assignmentIdNum,
        user.id,
      );
      return successResponse(result, 200);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/programs/[id]/assignments/[assignmentId]" } },
  );
}

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const { id, assignmentId } = await context.params;
      const user = await requireUser();
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const assignmentIdNum = parsePositiveId(assignmentId);
      const body = await parseRequestBody(request) as Record<string, unknown>;
      const { action } = body;

      if (user.role === "OPERATOR") {
        // Operator hanya dapat release assignment miliknya
        if (action !== "release") {
          throw new ApiError("FORBIDDEN", "Operator hanya dapat melepass assignment.", 403);
        }
        const result = await programAssignmentService.release(
          assignmentIdNum,
          user.id,
          false,
          parsePositiveId(id),
        );
        return successResponse(result);
      }

      // Admin dapat release
      if (action !== "release") {
        throw new ApiError("VALIDATION_ERROR", "Action tidak valid.", 400);
      }
      const result = await programAssignmentService.release(
        assignmentIdNum,
        user.id,
        true,
        parsePositiveId(id),
      );
      return successResponse(result);
    },
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/programs/[id]/assignments/[assignmentId]" } },
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
      const { id, assignmentId } = await context.params;
      const result = await programAssignmentService.delete(
        parsePositiveId(assignmentId),
        user,
        parsePositiveId(id),
      );
      return successResponse(result);
    },
    undefined,
    { idempotencyScope: { method: "DELETE", path: "/api/programs/[id]/assignments/[assignmentId]" } },
  );
}
