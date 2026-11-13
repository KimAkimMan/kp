import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { programCostService } from "@/modules/programs/program-cost.service";
import { parsePositiveId } from "@/lib/http/request";

type Context = { params: Promise<{ costId: string; documentId: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const { costId, documentId } = await context.params;
    return successResponse(await programCostService.download(parsePositiveId(costId, "costId"), documentId, user));
  });
}
