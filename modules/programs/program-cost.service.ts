import { programCostRepository } from "./program-cost.repository";
import { programRepository } from "./program.repository";
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
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat melihat biaya.", 403);
    }
    // Operator hanya dapat melihat biaya program yang dikelolanya.
    if (user.role === "OPERATOR") {
      const program = await programRepository.findById(programId);
      if (!program || program.operatorPengelolaId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda tidak dapat melihat biaya program ini.", 403);
      }
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
      throw new ApiError("FORBIDDEN", "Hanya Admin yang dapat memverifikasi biaya.", 403);
    }
    return programCostRepository.verify(costId, decision, user.id, rejectionReason);
  },

  async addDocument(
    costId: number,
    file: File,
    user: AuthenticatedUser,
  ) {
    await this.assertCanManage(costId, user);
    // Validasi tipe dan ukuran file
    const ALLOWED_DOCUMENT_TYPES = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      throw new ApiError("INVALID_FILE_TYPE", "Tipe file dokumen tidak diizinkan.", 400);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError("FILE_TOO_LARGE", "Ukuran file melebihi batas 10MB.", 400);
    }
    return programCostRepository.addDocument(costId, file, user.id);
  },

  async presignDirect(costId: number, input: DirectUploadInput, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat menambahkan dokumen biaya.", 403);
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
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat menambahkan dokumen biaya.", 403);
    }
    await this.assertCanManage(costId, user);
    await completeDirectUpload(`costs/${costId}/documents`, input, "document");
    return programCostRepository.addDirectDocument({ costId, ...input, uploadedById: user.id });
  },

  async download(costId: number, documentId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat melihat dokumen biaya.", 403);
    }
    await this.assertCanManage(costId, user);
    const document = await programCostRepository.findDocumentById(documentId);
    if (document.costId !== costId) {
      throw new ApiError("DOCUMENT_NOT_FOUND", "Dokumen tidak terkait dengan biaya ini.", 404);
    }
    return { document, ...(await presignDownload(document.storageKey, document.originalName, document.mimeType)) };
  },

  async deleteDocument(documentId: string, user: AuthenticatedUser) {
    const document = await programCostRepository.findDocumentById(documentId);
    if (user.role === "OPERATOR") {
      const cost = await programCostRepository.findById(document.costId);
      if (cost.program.operatorPengelolaId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda tidak dapat menghapus dokumen biaya program operator lain.", 403);
      }
    }
    if (user.role !== "ADMIN" && document.uploadedById !== user.id) {
      throw new ApiError("FORBIDDEN", "Hanya pemilik dokumen yang dapat menghapus.", 403);
    }
    return programCostRepository.deleteDocument(documentId);
  },

  async listDocuments(costId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat melihat dokumen biaya.", 403);
    }
    // Operator hanya dapat melihat dokumen biaya program yang dikelolanya.
    const cost = await programCostRepository.findById(costId);
    if (user.role === "OPERATOR" && cost.program.operatorPengelolaId !== user.id) {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat melihat dokumen biaya program ini.", 403);
    }
    return programCostRepository.listDocuments(costId);
  },
};
