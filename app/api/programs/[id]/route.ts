import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseUpdateProgramInput } from "@/modules/programs/program.schema";
import { programService } from "@/modules/programs/program.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireUser();
    return successResponse(await programService.get(parsePositiveId((await context.params).id)));
  });
}

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const id = parsePositiveId((await context.params).id);
    await programService.assertCanEdit(id, user);
    return successResponse(await programService.update(id, parseUpdateProgramInput(await parseRequestBody(request))));
  });
}

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    return successResponse(await programService.remove(parsePositiveId((await context.params).id)));
  });
}
