import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { programProgressService } from "@/modules/programs/program-progress.service";

type Context = { params: Promise<{ progressId: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR", "PIMPINAN");
    const progressId = parsePositiveId((await context.params).progressId, "progressId");
    return successResponse(await programProgressService.download(progressId, user));
  });
}

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR", "PIMPINAN");
    const progressId = parsePositiveId((await context.params).progressId, "progressId");
    return successResponse(await programProgressService.download(progressId, user));
  });
}
