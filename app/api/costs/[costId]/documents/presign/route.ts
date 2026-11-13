import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { requireRole } from "@/modules/auth/auth.context";
import { parseDirectUploadInput } from "@/modules/storage/direct-upload.service";
import { programCostService } from "@/modules/programs/program-cost.service";

type Context = { params: Promise<{ costId: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const { costId } = await context.params;
    const input = parseDirectUploadInput(await parseRequestBody(request));
    return successResponse(await programCostService.presignDirect(parsePositiveId(costId, "costId"), input, user));
  });
}
