import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseSurveyInput } from "@/modules/surveys/survey.schema";
import { surveyService } from "@/modules/surveys/survey.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireUser();
    return successResponse(await surveyService.get((await context.params).id));
  });
}

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN", "OPERATOR");
    return successResponse(await surveyService.update(
      (await context.params).id,
      parseSurveyInput(await parseRequestBody(request), true),
    ));
  });
}

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    return successResponse(await surveyService.remove((await context.params).id));
  });
}
