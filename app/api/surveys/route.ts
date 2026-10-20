import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import { surveyService } from "@/modules/surveys/survey.service";
import { handleRoute } from "@/lib/http/route-handler";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseRequestBody } from "@/lib/http/request";
import { parseSurveyInput } from "@/modules/surveys/survey.schema";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await requireUser();
    const pagination = parsePagination(request.nextUrl.searchParams);
    const result = await surveyService.list(pagination);
    return paginatedResponse(result.items, {
      ...pagination,
      total: result.total,
      totalPages: Math.ceil(result.total / pagination.pageSize),
    });
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
