import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { surveyProgramLinkRepositoryWithSurvey } from "@/modules/surveys/survey-program-link.repository";

type Context = { params: Promise<{ linkId: string }> };

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    const linkId = (await context.params).linkId;
    const result = await surveyProgramLinkRepositoryWithSurvey.delete(linkId);
    return successResponse(result);
  });
}