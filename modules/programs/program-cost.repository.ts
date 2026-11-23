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
  async findDocumentById(id: string) {
    const document = await prisma.programCostDocument.findUnique({
      where: { id },
      include: { uploadedBy: { select: { id: true, nama: true } } },
    });
    if (!document) throw new ApiError("DOCUMENT_NOT_FOUND", "Dokumen tidak ditemukan.", 404);
    return document;
  },

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
        program: { select: { operatorPengelolaId: true } },
        inputBy: { select: { id: true, nama: true, role: true } },
        verifiedBy: { select: { id: true, nama: true, role: true } },
        documents: true,
      },
    });
    if (!cost) throw new ApiError("COST_NOT_FOUND", "Biaya tidak ditemukan.", 404);
    return cost;
  },

  async verify(costId: number, decision: "APPROVED" | "REJECTED", reviewerId: number, rejectionReason?: string) {
    return prisma.$transaction(async (tx) => {
      // Transisi status atomik: hanya baris berstatus DIAJUKAN yang bisa diubah.
      // Dua admin yang memverifikasi bersamaan: hanya satu yang berhasil (count=1),
      // yang lain mendapat count=0 → COST_ALREADY_VERIFIED (409).
      const transition = await tx.programCost.updateMany({
        where: { id: costId, status: CostStatus.DIAJUKAN },
        data: {
          status: decision === "APPROVED" ? CostStatus.DIVERIFIKASI : CostStatus.DITOLAK,
          verifiedById: reviewerId,
          verifiedAt: new Date(),
          rejectionReason: decision === "REJECTED" ? rejectionReason ?? "Ditolak" : null,
        },
      });

      if (transition.count === 0) {
        // Bedakan: tidak ada vs sudah diverifikasi.
        const exists = await tx.programCost.findUnique({ where: { id: costId }, select: { id: true } });
        if (!exists) throw new ApiError("COST_NOT_FOUND", "Biaya tidak ditemukan.", 404);
        throw new ApiError("COST_ALREADY_VERIFIED", "Biaya telah diverifikasi sebelumnya.", 409);
      }

      const updated = await tx.programCost.findUniqueOrThrow({
        where: { id: costId },
        include: {
          inputBy: { select: { id: true, nama: true, role: true } },
          verifiedBy: { select: { id: true, nama: true, role: true } },
          documents: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: decision === "APPROVED" ? "APPROVE" : "REJECT",
          entity: "ProgramCost",
          entityId: String(costId),
          details: {
            programId: updated.programId,
            fromStatus: CostStatus.DIAJUKAN,
            toStatus: decision === "APPROVED" ? CostStatus.DIVERIFIKASI : CostStatus.DITOLAK,
            nominal: updated.nominal,
            rejectionReason: decision === "REJECTED" ? rejectionReason : null,
          },
        },
      });

      // Biaya hanya mengurangi pagu saat DIVERIFIKASI. Saat DITOLAK, penggunaan tidak berubah
      // (karena tidak pernah ditambahkan saat DIAJUKAN).
      if (decision === "APPROVED") {
        // Kunci baris Program agar cek pagu + increment serial (mencegah dua biaya
        // berbeda yang diverifikasi bersamaan sama-sama lolos cek pagu).
        const locked = await tx.$queryRawUnsafe<Array<{ pagu: unknown; penggunaan: unknown }>>(
          `SELECT pagu, penggunaan FROM Program WHERE id = ? FOR UPDATE`,
          updated.programId,
        );
        if (!locked || locked.length === 0) {
          throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
        }
        const pagu = Number(locked[0].pagu);
        const penggunaan = Number(locked[0].penggunaan);
        const totalSetelahDisetujui = penggunaan + Number(updated.nominal);
        if (pagu > 0 && totalSetelahDisetujui > pagu) {
          throw new ApiError(
            "COST_EXCEEDS_BUDGET",
            `Penggunaan biaya (${totalSetelahDisetujui}) melebihi pagu program (${pagu}).`,
            400,
          );
        }
        await tx.program.update({
          where: { id: updated.programId },
          data: {
            penggunaan: { increment: updated.nominal },
            penggunaanBiaya: { increment: updated.nominal },
          },
        });
      }

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

  async addDirectDocument(input: {
    costId: number;
    storageKey: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    uploadedById: number;
  }) {
    await this.findById(input.costId);
    return prisma.programCostDocument.create({
      data: input,
      include: { uploadedBy: { select: { id: true, nama: true } } },
    });
  },

  async deleteDocument(documentId: string) {
    const document = await this.findDocumentById(documentId);

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
