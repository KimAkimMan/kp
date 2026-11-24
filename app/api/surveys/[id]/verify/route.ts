import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { surveyService } from "@/modules/surveys/survey.service";
import { parseJsonObject } from "@/lib/validation";
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
      const body = parseJsonObject(await parseRequestBody(request));
      const programId = body.programId === undefined || body.programId === null
        ? null
        : parsePositiveId(String(body.programId), "programId");
      return successResponse(await surveyService.verify((await context.params).id, programId, user.id));
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/surveys/[id]/verify" } },
  );
}
