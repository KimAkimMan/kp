import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { surveyProgramLinkService } from "@/modules/surveys/survey-program-link.service";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { ApiError } from "@/lib/http/api-error";
import { parsePositiveId } from "@/lib/http/request";

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
      const surveyId = (await context.params).id;
      const body = await request.json();
      const { programId, relationType } = body;

      const programIdNum = parsePositiveId(String(programId), "programId");

      const result = await surveyProgramLinkService.create(
        surveyId,
        { programId: programIdNum, relationType },
        user as AuthenticatedUser,
      );
      return successResponse(result, 201);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/surveys/[id]/links" } },
  );
}
