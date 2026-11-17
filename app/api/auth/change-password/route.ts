import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { authService } from "@/modules/auth/auth.service";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    await authService.changePassword(await requireUser(), await request.json());
    return successResponse({ changed: true });
  });
}
