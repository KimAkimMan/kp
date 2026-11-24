import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { surveyProgramLinkService } from "@/modules/surveys/survey-program-link.service";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { ApiError } from "@/lib/http/api-error";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { operationRateLimiter } from "@/modules/auth/rate-limit";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const surveyId = (await context.params).id;
    const result = await surveyProgramLinkService.list(surveyId, user as AuthenticatedUser);
    return successResponse(result);
  });
}
export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN", "OPERATOR");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const surveyId = (await context.params).id;
      const body = await parseRequestBody(request) as Record<string, unknown>;
      const { programId, relationType } = body;

      const programIdNum = parsePositiveId(String(programId), "programId");
      const relationTypeValue =
        typeof relationType === "string" ? relationType : undefined;

      const result = await surveyProgramLinkService.create(
        surveyId,
        { programId: programIdNum, relationType: relationTypeValue },
        user as AuthenticatedUser,
      );
      return successResponse(result, 201);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/surveys/[id]/links" } },
  );
}
