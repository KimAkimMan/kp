import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parseConvertSurveyInput } from "@/modules/surveys/survey.convert.schema";
import { surveyService } from "@/modules/surveys/survey.service";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    return successResponse(
      await surveyService.convertToProgram(
        (await context.params).id,
        parseConvertSurveyInput(await parseRequestBody(request)),
      ),
      201,
    );
  });
}
