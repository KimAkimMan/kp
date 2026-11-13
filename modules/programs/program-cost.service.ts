import { programCostRepository } from "./program-cost.repository";
import type { CostDocumentInput } from "./program-cost.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const programCostService = {
  async list(programId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat melihat biaya.");
    }
    return programCostRepository.list(programId);
  },

  async verify(
    costId: number,
    decision: "APPROVED" | "REJECTED",
    user: AuthenticatedUser,
    rejectionReason?: string,
  ) {
    if (user.role !== "ADMIN") {
      throw new Error("Hanya Admin yang dapat memverifikasi biaya.");
    }
    return programCostRepository.verify(costId, decision, user.id, rejectionReason);
  },

  async addDocument(
    costId: number,
    file: File,
    uploadedById?: number,
  ) {
    return programCostRepository.addDocument(costId, file, uploadedById);
  },

  async deleteDocument(documentId: number, userId: number) {
    const document = await prismaProgramCostDocumentFindById(documentId);
    if (document.uploadedById !== userId) {
      throw new Error("Hanya pemilik dokumen yang dapat menghapus.");
    }
    return programCostRepository.deleteDocument(documentId);
  },
};

// Helper untuk find document by id
async function prismaProgramCostDocumentFindById(id: number) {
  const { prisma } = await import("@/lib/prisma");
  const document = await prisma.programCostDocument.findUnique({ where: { id } });
  if (!document) throw new Error("Dokumen tidak ditemukan.");
  return document;
}