import { prisma } from "@/lib/prisma";
import { CostStatus } from "@/generated/prisma/client";
import { ApiError } from "@/lib/http/api-error";
import { getStorage } from "@/lib/storage";

export type CostDocumentInput = {
  costId: number;
  uploadedById?: number;
  file: File;
  originalName: string;
  mimeType: string;
};

export const programCostRepository = {
  async list(programId: number) {
    const program = await prisma.program.findFirst({
      where: { id: programId, deletedAt: null },
      select: { id: true },
    });
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);

    return prisma.programCost.findMany({
      where: { programId },
      include: {
        inputBy: { select: { id: true, nama: true, role: true } },
        verifiedBy: { select: { id: true, nama: true, role: true } },
        documents: true,
      },
      orderBy: { tanggal: "desc" },
    });
  },

  async findById(id: number) {
    const cost = await prisma.programCost.findUnique({
      where: { id },
      include: {
        inputBy: { select: { id: true, nama: true, role: true } },
        verifiedBy: { select: { id: true, nama: true, role: true } },
        documents: true,
      },
    });
    if (!cost) throw new ApiError("COST_NOT_FOUND", "Biaya tidak ditemukan.", 404);
    return cost;
  },

  async verify(costId: number, decision: "APPROVED" | "REJECTED", reviewerId: number, rejectionReason?: string) {
    const cost = await this.findById(costId);
    if (cost.status === CostStatus.DIVERIFIKASI || cost.status === CostStatus.DITOLAK) {
      throw new ApiError("COST_ALREADY_VERIFIED", "Biaya telah diverifikasi sebelumnya.", 409);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.programCost.update({
        where: { id: costId },
        data: {
          status: decision === "APPROVED" ? CostStatus.DIVERIFIKASI : CostStatus.DITOLAK,
          verifiedById: reviewerId,
          verifiedAt: new Date(),
          rejectionReason: decision === "REJECTED" ? rejectionReason ?? "Ditolak" : null,
        },
        include: {
          inputBy: { select: { id: true, nama: true, role: true } },
          verifiedBy: { select: { id: true, nama: true, role: true } },
          documents: true,
        },
      });

      return updated;
    });
  },

  async addDocument(
    costId: number,
    file: File,
    uploadedById?: number,
  ) {
    await this.findById(costId);
    const storage = getStorage();
    const storageKey = `costs/${costId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await storage.upload({
      key: storageKey,
      contentType: file.type,
      body: buffer,
      metadata: {
        originalName: file.name,
        costId: String(costId),
        uploadedAt: new Date().toISOString(),
      },
    });

    return prisma.programCostDocument.create({
      data: {
        costId,
        storageKey,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        uploadedById,
      },
      include: {
        uploadedBy: { select: { id: true, nama: true } },
      },
    });
  },

  async deleteDocument(documentId: string) {
    const document = await prisma.programCostDocument.findUnique({
      where: { id: documentId },
    });
    if (!document) throw new ApiError("DOCUMENT_NOT_FOUND", "Dokumen tidak ditemukan.", 404);

    const storage = getStorage();
    try {
      await storage.delete(document.storageKey);
    } catch {
      // Abaikan error delete dari storage, lanjutkan delete DB record
    }

    return prisma.programCostDocument.delete({
      where: { id: documentId },
    });
  },
};
