import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parsePositiveId } from "@/lib/http/request";
import { programProgressRepository } from "@/modules/programs/program-progress.repository";

type Context = { params: Promise<{ progressId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN");
    const progressId = parsePositiveId((await context.params).progressId);
    const body = await request.json();
    const { decision, rejectionReason } = body;

    if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
      throw new Error("Decision harus 'APPROVED' atau 'REJECTED'.");
    }

    const result = await programProgressRepository.verify(
      progressId,
      decision,
      user.id,
      rejectionReason,
    );
    return successResponse(result);
  });
}