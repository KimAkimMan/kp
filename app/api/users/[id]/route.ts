import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parseUpdateUserInput } from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    return successResponse(await userService.get(parsePositiveId((await context.params).id)));
  });
}

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      await requireRole("ADMIN");
      const id = parsePositiveId((await context.params).id);
      return successResponse(await userService.update(id, parseUpdateUserInput(await parseRequestBody(request))));
    },
    undefined,
    { idempotencyScope: { method: "PATCH", path: "/api/users/[id]" } },
  );
}

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN");
      return successResponse(await userService.remove(parsePositiveId((await context.params).id), user.id));
    },
    undefined,
    { idempotencyScope: { method: "DELETE", path: "/api/users/[id]" } },
  );
}
