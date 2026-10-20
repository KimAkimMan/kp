import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseAdviceStatusInput } from "@/modules/advice/advice.schema";
import { adviceService } from "@/modules/advice/advice.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireUser();
    const { id } = await context.params;
    return successResponse(await adviceService.get(id));
  });
}

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN", "OPERATOR", "PIMPINAN");
    const { status } = parseAdviceStatusInput(await parseRequestBody(request));
    return successResponse(await adviceService.updateStatus((await context.params).id, status));
  });
}

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("PIMPINAN", "ADMIN");
    return successResponse(await adviceService.remove((await context.params).id));
  });
}
