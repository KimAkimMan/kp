import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { programProgressRepository } from "@/modules/programs/program-progress.repository";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ progressId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const progressId = parsePositiveId((await context.params).progressId);
      const body = await parseRequestBody(request) as Record<string, unknown>;
      const { decision, rejectionReason } = body;

      if (
        typeof decision !== "string" ||
        !["APPROVED", "REJECTED"].includes(decision)
      ) {
        throw new ApiError("VALIDATION_ERROR", "Decision harus 'APPROVED' atau 'REJECTED'.", 400);
      }
      const verifiedDecision = decision as "APPROVED" | "REJECTED";

      const result = await programProgressRepository.verify(
        progressId,
        verifiedDecision,
        user.id,
        typeof rejectionReason === "string" ? rejectionReason : undefined,
      );
      return successResponse(result);
    },
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/progress/[progressId]/verify" } },
  );
}