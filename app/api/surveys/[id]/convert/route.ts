import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parseConvertSurveyInput } from "@/modules/surveys/survey.convert.schema";
import { surveyService } from "@/modules/surveys/survey.service";
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
      return successResponse(
        await surveyService.convertToProgram(
          (await context.params).id,
          parseConvertSurveyInput(await parseRequestBody(request)),
          user.id,
        ),
        201,
      );
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/surveys/[id]/convert" } },
  );
}
