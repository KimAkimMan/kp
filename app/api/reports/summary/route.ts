import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireUser();
    const where = user.role === "OPERATOR" ? { operatorPengelolaId: user.id } : {};
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
