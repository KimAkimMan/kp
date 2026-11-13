import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { programCostService } from "@/modules/programs/program-cost.service";

type Context = { params: Promise<{ costId: string; documentId: string }> };

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const { documentId } = await context.params;
    const result = await programCostService.deleteDocument(documentId, user);
    return successResponse(result);
  });
}
