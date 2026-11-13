import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { adviceReplyRepository } from "@/modules/advice/advice-reply.repository";

type Context = { params: Promise<{ replyId: string }> };

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const replyId = (await context.params).replyId;
    const result = await adviceReplyRepository.delete(replyId, user.id, user.role);
    return successResponse(result);
  });
}