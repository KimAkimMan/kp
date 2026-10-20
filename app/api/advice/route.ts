import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import { adviceService } from "@/modules/advice/advice.service";
import { handleRoute } from "@/lib/http/route-handler";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseRequestBody } from "@/lib/http/request";
import { parseCreateAdviceInput } from "@/modules/advice/advice.schema";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await requireUser();
    const pagination = parsePagination(request.nextUrl.searchParams);
    const result = await adviceService.list(pagination);
    return paginatedResponse(result.items, {
      ...pagination,
      total: result.total,
      totalPages: Math.ceil(result.total / pagination.pageSize),
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
