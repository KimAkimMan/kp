import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { surveyProgramLinkRepositoryWithSurvey } from "@/modules/surveys/survey-program-link.repository";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ linkId: string }> };

export async function DELETE(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const linkId = (await context.params).linkId;
      const result = await surveyProgramLinkRepositoryWithSurvey.delete(linkId);
      return successResponse(result);
    },
    undefined,
    { idempotencyScope: { method: "DELETE", path: "/api/surveys/links/[linkId]" } },
  );
}