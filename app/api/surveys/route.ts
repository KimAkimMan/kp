import { NextRequest } from "next/server";
import { successResponse } from "@/lib/http/api-response";
import { surveyService } from "@/modules/surveys/survey.service";
import { handleRoute } from "@/lib/http/route-handler";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseRequestBody } from "@/lib/http/request";
import { parseSurveyInput } from "@/modules/surveys/survey.schema";

export async function GET() {
  return handleRoute(async () => {
    await requireUser();
    return successResponse(await surveyService.list());
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const input = parseSurveyInput(await parseRequestBody(request));
    input.surveyorId ??= user.id;
    input.surveyor ||= user.nama;
    return successResponse(await surveyService.create(input), 201);
  });
}
