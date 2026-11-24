import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import {
  parseCreateProgramInput,
  parseUpsertProgramInput,
} from "@/modules/programs/program.schema";
import { programService } from "@/modules/programs/program.service";
import { handleRoute } from "@/lib/http/route-handler";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parsePagination } from "@/lib/pagination";
import { parseProgramListFilters } from "@/modules/programs/program.schema";
import { parseRequestBody } from "@/lib/http/request";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

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
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const input = parseCreateProgramInput(await parseRequestBody(request));
      return successResponse(await programService.create(input, user.id), 201);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/programs" } },
  );
}

export async function PUT(request: NextRequest) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const input = parseUpsertProgramInput(await parseRequestBody(request));
      const { program, created } = await programService.upsert(input, user.id);
      return successResponse(program, created ? 201 : 200);
    },
    undefined,
    { idempotencyScope: { method: "PUT", path: "/api/programs" } },
  );
}
