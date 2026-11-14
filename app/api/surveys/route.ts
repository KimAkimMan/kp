import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import { surveyService } from "@/modules/surveys/survey.service";
import { handleRoute } from "@/lib/http/route-handler";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseRequestBody } from "@/lib/http/request";
import { parseSurveyInput } from "@/modules/surveys/survey.schema";
import type { SurveyInput } from "@/modules/surveys/survey.types";
import { parsePagination } from "@/lib/pagination";
import { ApiError } from "@/lib/http/api-error";

const surveyStatuses = ["DRAFT", "SELESAI_SURVEY", "MENUNGGU_VERIFIKASI", "PERLU_REVISI", "DIVERIFIKASI", "DIKONVERSI"];

function parseSurveyListFilters(params: URLSearchParams) {
  const status = params.get("status") ?? undefined;
  if (status && !surveyStatuses.includes(status)) {
    throw new ApiError("VALIDATION_ERROR", "Status survey tidak valid.", 400);
  }
  return {
    search: params.get("search")?.trim() || undefined,
    status: (status as SurveyInput["status"] | undefined),
    kecamatan: params.get("kecamatan") ?? undefined,
    pagination: parsePagination(params),
  };
}

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireUser();
    const filters = parseSurveyListFilters(request.nextUrl.searchParams);
    const result = await surveyService.list(filters, user);
    return paginatedResponse(result.items, {
      ...filters.pagination,
      total: result.total,
      totalPages: Math.ceil(result.total / filters.pagination.pageSize),
    });
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const input = parseSurveyInput(await parseRequestBody(request));
    if (user.role === "OPERATOR") {
      input.surveyorId = user.id;
      input.surveyor = user.nama;
    }
    return successResponse(await surveyService.create(input, user), 201);
  });
}
