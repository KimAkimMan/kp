import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { adviceReplyService } from "@/modules/advice/advice-reply.service";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

type Context = { params: Promise<{ id: string; replyId?: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const adviceId = (await context.params).id;
    const result = await adviceReplyService.list(adviceId, user as AuthenticatedUser);
    return successResponse(result);
  });
}

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR", "PIMPINAN");
    const adviceId = (await context.params).id;
    const body = await request.json();
    const { isi } = body;

    if (!isi || typeof isi !== "string" || isi.trim().length === 0) {
      throw new Error("Isi balasan wajib diisi.");
    }

    const result = await adviceReplyService.create(
      adviceId,
      { isi: isi.trim() },
      user as AuthenticatedUser,
    );
    return successResponse(result, 201);
  });
}

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const { id, replyId } = await context.params;
    const result = await adviceReplyService.delete(replyId, user as AuthenticatedUser);
    return successResponse(result);
  });
}