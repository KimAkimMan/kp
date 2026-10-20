import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import { parseCreateProgramInput } from "@/modules/programs/program.schema";
import { programService } from "@/modules/programs/program.service";
import { handleRoute } from "@/lib/http/route-handler";
import { requireUser } from "@/modules/auth/auth.context";
import { parsePagination } from "@/lib/pagination";
import { parseProgramListFilters } from "@/modules/programs/program.schema";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireUser();
    const filters = parseProgramListFilters(request.nextUrl.searchParams);
    const pagination = parsePagination(request.nextUrl.searchParams);
    filters.pagination = pagination;
    if (user.role === "OPERATOR") filters.operatorId = user.id;
    const result = await programService.list(filters);
    return paginatedResponse(result.items, {
      ...pagination,
      total: result.total,
      totalPages: Math.ceil(result.total / pagination.pageSize),
    });
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    await requireUser();
    const input = parseCreateProgramInput(await request.json());
    return successResponse(await programService.create(input), 201);
  });
}
