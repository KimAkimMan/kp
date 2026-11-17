import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { parsePositiveId } from "@/lib/http/request";
import { programHistoryService } from "@/modules/programs/program-history.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireUser();
    const programId = parsePositiveId((await context.params).id);
    const result = await programHistoryService.list(programId);
    return successResponse(result);
  });
}