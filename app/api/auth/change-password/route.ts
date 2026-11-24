import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { authService } from "@/modules/auth/auth.service";
import { parseRequestBody } from "@/lib/http/request";

export async function POST(request: NextRequest) {
  return handleRoute(
    async () => {
      await authService.changePassword(await requireUser(), await parseRequestBody(request));
      return successResponse({ changed: true });
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/auth/change-password" } },
  );
}
