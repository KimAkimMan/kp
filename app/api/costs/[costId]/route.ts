import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parsePositiveId } from "@/lib/http/request";
import { programCostService } from "@/modules/programs/program-cost.service";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ costId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const costId = parsePositiveId((await context.params).costId);
      const body = await request.json();
      const { decision, rejectionReason } = body;

      if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
        throw new ApiError("VALIDATION_ERROR", "Decision harus 'APPROVED' atau 'REJECTED'.", 400);
      }

      const result = await programCostService.verify(
        costId,
        decision,
        user as AuthenticatedUser,
        rejectionReason,
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
    await requireRole("ADMIN", "OPERATOR");
    const costId = parsePositiveId((await context.params).costId);
    const documents = await programCostService.listDocuments(costId, await requireRole("ADMIN", "OPERATOR"));
    return successResponse(documents);
  });
}