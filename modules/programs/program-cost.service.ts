import { programCostRepository } from "./program-cost.repository";
import { ApiError } from "@/lib/http/api-error";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { completeDirectUpload, presignDirectUpload, presignDownload, type DirectUploadInput } from "@/modules/storage/direct-upload.service";

export const programCostService = {
  async assertCanManage(costId: number, user: AuthenticatedUser) {
    const cost = await programCostRepository.findById(costId);
    if (user.role === "OPERATOR" && cost.program.operatorPengelolaId !== user.id) {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat mengelola biaya program operator lain.", 403);
    }
    return cost;
  },

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

  async presignDirect(costId: number, input: DirectUploadInput, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat menambahkan dokumen biaya.");
    }
    await this.assertCanManage(costId, user);
    return presignDirectUpload(`costs/${costId}/documents`, input, "document");
  },

  async completeDirect(
    costId: number,
    input: DirectUploadInput & { storageKey: string },
    user: AuthenticatedUser,
  ) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat menambahkan dokumen biaya.");
    }
    await this.assertCanManage(costId, user);
    await completeDirectUpload(`costs/${costId}/documents`, input, "document");
    return programCostRepository.addDirectDocument({ costId, ...input, uploadedById: user.id });
  },

  async download(costId: number, documentId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat melihat dokumen biaya.");
    }
    const document = await programCostRepository.findDocumentById(documentId);
    if (document.costId !== costId) {
      throw new ApiError("DOCUMENT_NOT_FOUND", "Dokumen tidak terkait dengan biaya ini.", 404);
    }
    return { document, ...(await presignDownload(document.storageKey, document.originalName, document.mimeType)) };
  },

  async deleteDocument(documentId: string, user: AuthenticatedUser) {
    const document = await prismaProgramCostDocumentFindById(documentId);
    if (user.role !== "ADMIN" && document.uploadedById !== user.id) {
      throw new ApiError("FORBIDDEN", "Hanya pemilik dokumen yang dapat menghapus.", 403);
    }
    return programCostRepository.deleteDocument(documentId);
  },
};

// Helper untuk find document by id
async function prismaProgramCostDocumentFindById(id: string) {
  const { programCostRepository } = await import("./program-cost.repository");
  return programCostRepository.findDocumentById(id);
}
