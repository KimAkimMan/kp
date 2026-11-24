import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import { adviceService } from "@/modules/advice/advice.service";
import { handleRoute } from "@/lib/http/route-handler";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseRequestBody } from "@/lib/http/request";
import { parseCreateAdviceInput } from "@/modules/advice/advice.schema";
import { parsePagination } from "@/lib/pagination";
import { ApiError } from "@/lib/http/api-error";
import { operationRateLimiter } from "@/modules/auth/rate-limit";

const adviceStatuses = ["BELUM_DITINDAKLANJUTI", "SUDAH_DITINDAKLANJUTI"];

function parseAdviceListFilters(params: URLSearchParams) {
  const status = params.get("status") ?? undefined;
  if (status && !adviceStatuses.includes(status)) {
    throw new ApiError("VALIDATION_ERROR", "Status arahan tidak valid.", 400);
  }
  const operatorIdValue = params.get("operatorId");
  const operatorId = operatorIdValue === null ? undefined : Number(operatorIdValue);
  if (operatorId !== undefined && (!Number.isSafeInteger(operatorId) || operatorId < 1)) {
    throw new ApiError("VALIDATION_ERROR", "operatorId harus berupa bilangan bulat positif.", 400);
  }
  return {
    search: params.get("search")?.trim() || undefined,
    status: (status as "BELUM_DITINDAKLANJUTI" | "SUDAH_DITINDAKLANJUTI" | undefined),
    operatorId,
    pagination: parsePagination(params),
  };
}

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireUser();
    const filters = parseAdviceListFilters(request.nextUrl.searchParams);
    if (user.role === "OPERATOR") filters.operatorId = user.id;
    const result = await adviceService.list(filters);
    return paginatedResponse(result.items, {
      ...filters.pagination,
      total: result.total,
      totalPages: Math.ceil(result.total / filters.pagination.pageSize),
    });
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(
    async () => {
      const user = await requireRole("PIMPINAN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const input = parseCreateAdviceInput(await parseRequestBody(request));
      return successResponse(await adviceService.create({
        ...input,
        pimpinanId: user.id,
        identitasPimpinan: user.nama,
      }), 201);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/advice" } },
  );
}
