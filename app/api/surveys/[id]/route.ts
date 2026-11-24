import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseSurveyInput } from "@/modules/surveys/survey.schema";
import { surveyService } from "@/modules/surveys/survey.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    return successResponse(await surveyService.get((await context.params).id, user));
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
      return successResponse(await surveyService.update(
        (await context.params).id,
        parseSurveyInput(await parseRequestBody(request), true),
        user,
      ));
    },
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/surveys/[id]" } },
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
      return successResponse(await surveyService.remove((await context.params).id));
    },
    undefined,
    { idempotencyScope: { method: "DELETE", path: "/api/surveys/[id]" } },
  );
}
