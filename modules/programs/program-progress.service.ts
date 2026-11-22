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
    // Hanya verifikasi upload ke object storage. Penyimpanan storageKey ke database
    // dilakukan oleh addProgress setelah progress record dibuat.
    await completeDirectUpload(`progress/${progressId}/photos`, input, "image");
    return { storageKey: input.storageKey, originalName: input.originalName };
  },

  async download(progressId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR" && user.role !== "PIMPINAN") {
      throw new Error("Hanya Admin, Operator, dan Pimpinan yang dapat melihat foto progres.");
    }
    const photo = await programProgressRepository.findPhotoByProgressId(progressId);
    if (!photo) throw new ApiError("PROGRESS_PHOTO_NOT_FOUND", "Foto progres tidak ditemukan.", 404);
    // storageKey dan originalName disimpan sebagai daftar koma-separated (bisa banyak foto)
    const keys = (photo.storageKey ?? "").split(",").filter(Boolean);
    const names = (photo.originalName ?? "").split(",").filter(Boolean);
    const downloads = keys.map((key, idx) => ({
      storageKey: key,
      originalName: names[idx] ?? `foto-progres-${idx + 1}.jpg`,
      ...(presignDownload(key, names[idx] ?? `foto-progres-${idx + 1}.jpg`, "image/jpeg")),
    }));
    return { photo, downloads };
  },
};