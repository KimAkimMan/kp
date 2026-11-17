import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import { adviceService } from "@/modules/advice/advice.service";
import { handleRoute } from "@/lib/http/route-handler";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseRequestBody } from "@/lib/http/request";
import { parseCreateAdviceInput } from "@/modules/advice/advice.schema";
import { parsePagination } from "@/lib/pagination";

const adviceStatuses = ["BELUM_DITINDAKLANJUTI", "SUDAH_DITINDAKLANJUTI"];

function parseAdviceListFilters(params: URLSearchParams) {
  const status = params.get("status") ?? undefined;
  if (status && !adviceStatuses.includes(status)) {
    throw new Error("Status arahan tidak valid.");
  }
  return {
    search: params.get("search")?.trim() || undefined,
    status: (status as "BELUM_DITINDAKLANJUTI" | "SUDAH_DITINDAKLANJUTI" | undefined),
    pagination: parsePagination(params),
  };
}

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await requireUser();
    const filters = parseAdviceListFilters(request.nextUrl.searchParams);
    const result = await adviceService.list(filters);
    return paginatedResponse(result.items, {
      ...filters.pagination,
      total: result.total,
      totalPages: Math.ceil(result.total / filters.pagination.pageSize),
    });
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireRole("PIMPINAN");
    const input = parseCreateAdviceInput(await parseRequestBody(request));
    input.pimpinanId = user.id;
    input.identitasPimpinan = user.nama;
    return successResponse(await adviceService.create(input), 201);
  });
}
