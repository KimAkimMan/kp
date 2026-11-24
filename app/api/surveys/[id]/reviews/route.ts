import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { surveyReviewRepository, surveyStatusHistoryRepository } from "@/modules/surveys/survey-review.repository";
import { ApiError } from "@/lib/http/api-error";
import { operationRateLimiter } from "@/modules/auth/rate-limit";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireUser();
    const { id } = await context.params;
    const reviews = await surveyReviewRepository.list(id);
    const history = await surveyStatusHistoryRepository.list(id);
    return successResponse({ reviews, history });
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
      const { id } = await context.params;
      const body = await parseRequestBody(request) as Record<string, unknown>;
      const { decision, notes } = body;
      if (
        typeof decision !== "string" ||
        !["DITOLAK", "PERLU_REVISI", "DISETUJUI"].includes(decision)
      ) {
        throw new ApiError("VALIDATION_ERROR", "Decision harus 'DITOLAK', 'PERLU_REVISI', atau 'DISETUJUI'.", 400);
      }
      return successResponse(await surveyReviewRepository.review(
        id,
        decision as "DITOLAK" | "PERLU_REVISI" | "DISETUJUI",
        notes,
        user.id,
      ));
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/surveys/[id]/reviews" } },
  );
}
