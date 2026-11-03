import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { programService } from "@/modules/programs/program.service";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("OPERATOR");
    const id = parsePositiveId((await context.params).id);
    return successResponse(await programService.claim(id, user));
  });
}
