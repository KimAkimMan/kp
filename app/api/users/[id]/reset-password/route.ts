import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { requireRole } from "@/modules/auth/auth.context";
import { userService } from "@/modules/users/user.service";
import { parseJsonObject, passwordString } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    const { id } = await context.params;
    await userService.update(parsePositiveId(id), { password: passwordString(parseJsonObject(await parseRequestBody(request))) });
    return successResponse({ reset: true });
  });
}
