import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("OPERATOR");
    const id = parsePositiveId((await context.params).id);
    const program = await prisma.program.findFirst({ where: { id, deletedAt: null } });
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    if (program.operatorPengelolaId === user.id) return successResponse(program);
    const claimed = await prisma.program.updateMany({
      where: { id, deletedAt: null, operatorPengelolaId: null },
      data: {
        operatorPengelolaId: user.id,
        operatorPengelola: user.nama,
        pj: user.nama,
      },
    });
    if (claimed.count !== 1) {
      throw new ApiError("PROGRAM_ALREADY_ASSIGNED", "Kegiatan telah diambil operator lain.", 409);
    }
    return successResponse(await prisma.program.findUnique({
      where: { id },
      include: { operator: true, histories: true, costs: true },
    }));
  });
}
