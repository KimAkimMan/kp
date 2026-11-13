import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parsePositiveId } from "@/lib/http/request";
import { programCostService } from "@/modules/programs/program-cost.service";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

type Context = { params: Promise<{ costId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN");
    const costId = parsePositiveId((await context.params).costId);
    const body = await request.json();
    const { decision, rejectionReason } = body;

    if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
      throw new Error("Decision harus 'APPROVED' atau 'REJECTED'.");
    }

    const result = await programCostService.verify(
      costId,
      decision,
      user as AuthenticatedUser,
      rejectionReason,
    );
    return successResponse(result);
  });
}

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const costId = parsePositiveId((await context.params).costId);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new Error("File tidak ditemukan.");
    }

    const result = await programCostService.addDocument(costId, file, user.id);
    return successResponse(result, 201);
  });
}

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN", "OPERATOR");
    const costId = parsePositiveId((await context.params).costId);

    const { prisma } = await import("@/lib/prisma");
    const documents = await prisma.programCostDocument.findMany({
      where: { costId },
      include: {
        uploadedBy: { select: { id: true, nama: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(documents);
  });
}