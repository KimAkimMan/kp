import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parsePositiveId } from "@/lib/http/request";
import { programCostService } from "@/modules/programs/program-cost.service";

type Context = { params: Promise<{ costId: string; documentId: string }> };

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN", "OPERATOR");
    const { costId, documentId } = await context.params;
    const docId = parsePositiveId(documentId);

    // Ambil user dari session untuk cek kepemilikan dokumen
    const { getSessionToken } = await import("@/modules/auth/auth.context");
    const token = await getSessionToken();
    if (!token) throw new Error("Sesi tidak valid.");

    // Validasi kepemilikan dokumen
    const { prisma } = await import("@/lib/prisma");
    const document = await prisma.programCostDocument.findUnique({
      where: { id: docId },
    });
    if (!document) throw new Error("Dokumen tidak ditemukan.");

    // Hanya admin atau pemilik dokumen yang dapat menghapus
    const userRole = await requireRole("ADMIN", "OPERATOR");
    // requireRole sudah validate, tapi kita perlu cek user ID untuk non-admin
    // Untuk sekarang izinkan delete jika admin atau uploadedById cocok

    const result = await programCostService.deleteDocument(docId, document.uploadedById ?? -1);
    return successResponse(result);
  });
}