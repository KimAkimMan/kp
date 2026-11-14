import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import { parseCreateUserInput } from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";
import { requireRole } from "@/modules/auth/auth.context";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { parsePagination } from "@/lib/pagination";

const userRoles = ["Admin", "Operator", "Pimpinan"];

function parseUserListFilters(params: URLSearchParams) {
  const role = params.get("role") ?? undefined;
  if (role && !userRoles.includes(role)) {
    throw new Error("Role pengguna tidak valid.");
  }
  return {
    search: params.get("search")?.trim() || undefined,
    role: (role as "Admin" | "Operator" | "Pimpinan" | undefined),
    pagination: parsePagination(params),
  };
}

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    const filters = parseUserListFilters(request.nextUrl.searchParams);
    const result = await userService.list(filters);
    return paginatedResponse(result.items, {
      ...filters.pagination,
      total: result.total,
      totalPages: Math.ceil(result.total / filters.pagination.pageSize),
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
