import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { adviceReplyRepository } from "@/modules/advice/advice-reply.repository";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ replyId: string }> };

export async function DELETE(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireUser();
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const replyId = (await context.params).replyId;
      const result = await adviceReplyRepository.delete(replyId, user.id, user.role);
      return successResponse(result);
    },
    undefined,
    { idempotencyScope: { method: "DELETE", path: "/api/advice/replies/[replyId]" } },
  );
}