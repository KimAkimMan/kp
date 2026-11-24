import { NextRequest } from "next/server";
import { paginatedResponse, successResponse } from "@/lib/http/api-response";
import { parseCreateUserInput } from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";
import { requireRole } from "@/modules/auth/auth.context";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { parsePagination } from "@/lib/pagination";
import { ApiError } from "@/lib/http/api-error";
import { operationRateLimiter } from "@/modules/auth/rate-limit";

const userRoles = ["Admin", "Operator", "Pimpinan"];

function parseUserListFilters(params: URLSearchParams) {
  const role = params.get("role") ?? undefined;
  if (role && !userRoles.includes(role)) {
    throw new ApiError("VALIDATION_ERROR", "Role pengguna tidak valid.", 400);
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
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const input = parseCreateUserInput(await parseRequestBody(request));
      return successResponse(await userService.create(input), 201);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/users" } },
  );
}
