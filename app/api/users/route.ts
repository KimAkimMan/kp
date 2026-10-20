import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import { parseCreateUserInput } from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";
import { requireRole } from "@/modules/auth/auth.context";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    const pagination = parsePagination(request.nextUrl.searchParams);
    const result = await userService.list(pagination);
    return paginatedResponse(result.items, {
      ...pagination,
      total: result.total,
      totalPages: Math.ceil(result.total / pagination.pageSize),
    });
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    const input = parseCreateUserInput(await parseRequestBody(request));
    return successResponse(await userService.create(input), 201);
  });
}
