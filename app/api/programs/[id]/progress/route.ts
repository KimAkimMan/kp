import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseProgressInput } from "@/modules/programs/program.action.schema";
import { programActions } from "@/modules/programs/program.actions";
import { programService } from "@/modules/programs/program.service";
import { programProgressService } from "@/modules/programs/program-progress.service";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const programId = parsePositiveId((await context.params).id);
    const result = await programProgressService.list(programId, user as AuthenticatedUser);
    return successResponse(result);
  });
}

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    await programService.assertCanEdit(parsePositiveId((await context.params).id), user);
    const result = await programActions.addProgress(
      parsePositiveId((await context.params).id),
      parseProgressInput(await parseRequestBody(request)),
      user.id,
      user.nama,
    );
    return successResponse(result, 201);
  });
}
