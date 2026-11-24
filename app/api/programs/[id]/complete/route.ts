import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { ApiError } from "@/lib/http/api-error";
import { requireRole } from "@/modules/auth/auth.context";
import { parseCompletionInput } from "@/modules/programs/program.action.schema";
import { programActions } from "@/modules/programs/program.actions";
import { programService } from "@/modules/programs/program.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN", "OPERATOR");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      await programService.assertCanEdit(parsePositiveId((await context.params).id), user);
      let completionBody: unknown = {};
      if (request.body !== null) {
        completionBody = await parseRequestBody(request);
      }
      const { foto } = parseCompletionInput(completionBody);
      return successResponse(
        (await programActions.markComplete(
          parsePositiveId((await context.params).id),
          user.id,
          user.nama,
          foto,
        )).program,
      );
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/programs/[id]/complete" } },
  );
}
