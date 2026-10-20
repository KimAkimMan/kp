import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { programActions } from "@/modules/programs/program.actions";
import { programService } from "@/modules/programs/program.service";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    await programService.assertCanEdit(parsePositiveId((await context.params).id), user);
    return successResponse(
      await programActions.markComplete(
        parsePositiveId((await context.params).id),
        user.id,
        user.nama,
      ),
    );
  });
}
