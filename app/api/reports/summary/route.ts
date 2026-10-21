import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { prisma } from "@/lib/prisma";
import { Prisma, ProgramStatus } from "@/generated/prisma/client";
import { ApiError } from "@/lib/http/api-error";

export const instant = false;

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireUser();
    const params = request.nextUrl.searchParams;
    const requestedStatus = params.get("status");
    if (requestedStatus && !Object.values(ProgramStatus).includes(requestedStatus as ProgramStatus)) {
      throw new ApiError("VALIDATION_ERROR", "Status program tidak valid.", 400);
    }
    const where: Prisma.ProgramWhereInput = {
      deletedAt: null,
      ...(user.role === "OPERATOR" ? { operatorPengelolaId: user.id } : {}),
      ...(params.get("periode") ? { periode: params.get("periode")! } : {}),
      ...(params.get("kecamatan") ? { kecamatan: params.get("kecamatan")! } : {}),
      ...(requestedStatus ? { status: requestedStatus as ProgramStatus } : {}),
    };
    const [count, groupedStatus, totals] = await Promise.all([
      prisma.program.count({ where }),
      prisma.program.groupBy({ by: ["status"], where, _count: { _all: true } }),
      prisma.program.aggregate({
        where,
        _sum: { target: true, realisasi: true, pagu: true, penggunaan: true },
      }),
    ]);
    return successResponse({
      filters: Object.fromEntries(request.nextUrl.searchParams.entries()),
      count,
      byStatus: groupedStatus,
      totals,
    });
  });
}
