import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { reportService } from "@/modules/reports/report.service";
import { ProgramStatus } from "@/generated/prisma/client";

export const instant = false;

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireUser();
    const params = request.nextUrl.searchParams;
    const requestedStatus = params.get("status");
    const summary = await reportService.summary({
      status: requestedStatus ? requestedStatus as ProgramStatus : undefined,
      operatorId: user.role === "OPERATOR" ? user.id : undefined,
      periode: params.get("periode") ?? undefined,
      kecamatan: params.get("kecamatan") ?? undefined,
    });
    return successResponse({
      filters: Object.fromEntries(request.nextUrl.searchParams.entries()),
      ...summary,
    });
  });
}
