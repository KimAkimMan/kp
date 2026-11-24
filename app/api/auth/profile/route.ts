import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { authService } from "@/modules/auth/auth.service";
import { parseRequestBody } from "@/lib/http/request";

export async function PATCH(request: NextRequest) {
  return handleRoute(
    async () =>
      successResponse(await authService.updateProfile(await requireUser(), await parseRequestBody(request))),
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/auth/profile" } },
  );
}
