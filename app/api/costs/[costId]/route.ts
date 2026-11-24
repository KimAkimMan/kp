import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { requireRole } from "@/modules/auth/auth.context";
import { programCostService } from "@/modules/programs/program-cost.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

type Context = { params: Promise<{ costId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const costId = parsePositiveId((await context.params).costId);
      const body = await parseRequestBody(request) as Record<string, unknown>;
      const { decision, rejectionReason } = body;

      if (
        typeof decision !== "string" ||
        !["APPROVED", "REJECTED"].includes(decision)
      ) {
        throw new ApiError("VALIDATION_ERROR", "Decision harus 'APPROVED' atau 'REJECTED'.", 400);
      }
      const verifiedDecision = decision as "APPROVED" | "REJECTED";

      const result = await programCostService.verify(
        costId,
        verifiedDecision,
        user as AuthenticatedUser,
        typeof rejectionReason === "string" ? rejectionReason : undefined,
      );
      return successResponse(result);
    },
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/costs/[costId]" } },
  );
}

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN", "OPERATOR");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const costId = parsePositiveId((await context.params).costId);
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        throw new ApiError("VALIDATION_ERROR", "File tidak ditemukan.", 400);
      }

      const result = await programCostService.addDocument(costId, file, user);
      return successResponse(result, 201);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/costs/[costId]" } },
  );
}

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const costId = parsePositiveId((await context.params).costId);
    const documents = await programCostService.listDocuments(costId, user);
    return successResponse(documents);
  });
}