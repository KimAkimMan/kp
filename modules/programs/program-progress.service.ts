import { programProgressRepository } from "./program-progress.repository";
import { completeDirectUpload, presignDirectUpload, presignDownload, type DirectUploadInput } from "@/modules/storage/direct-upload.service";
import { ApiError } from "@/lib/http/api-error";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const programProgressService = {
  async list(programId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat melihat progress.");
    }
    return programProgressRepository.list(programId);
  },

  async verify(
    progressId: number,
    decision: "APPROVED" | "REJECTED",
    user: AuthenticatedUser,
    rejectionReason?: string,
  ) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat memverifikasi progress.");
    }
    return programProgressRepository.verify(progressId, decision, user.id, rejectionReason);
  },

  async presignDirect(
    progressId: number,
    input: DirectUploadInput,
    user: AuthenticatedUser,
  ) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat mengunggah foto progres.");
    }
    return presignDirectUpload(`progress/${progressId}/photos`, input, "image");
  },

  async completeDirect(
    progressId: number,
    input: DirectUploadInput & { storageKey: string; caption?: string | null },
    user: AuthenticatedUser,
  ) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat mengunggah foto progres.");
    }
    await completeDirectUpload(`progress/${progressId}/photos`, input, "image");
    return programProgressRepository.updatePhoto(progressId, input.storageKey, input.caption ?? null);
  },

  async download(progressId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR" && user.role !== "PIMPINAN") {
      throw new Error("Hanya Admin, Operator, dan Pimpinan yang dapat melihat foto progres.");
    }
    const photo = await programProgressRepository.findPhotoByProgressId(progressId);
    if (!photo) throw new ApiError("PROGRESS_PHOTO_NOT_FOUND", "Foto progres tidak ditemukan.", 404);
    return { photo, ...(await presignDownload(photo.storageKey!, photo.originalName ?? "foto-progres.jpg", "image/jpeg")) };
  },
};